use crate::constants::PackageManagerType;
use crate::models::AppConfig;
use std::collections::HashSet;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Mutex, OnceLock};

/// 缓存从 shell 获取的 PATH
static SHELL_PATH: OnceLock<String> = OnceLock::new();

/// 缓存的 shell 环境变量，避免重复 source 配置文件
static SHELL_ENV: OnceLock<Mutex<std::collections::HashMap<String, String>>> = OnceLock::new();

/// 获取当前 shell 类型
fn get_shell() -> String {
  std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string())
}

/// 根据 shell 类型构建配置文件加载前缀
fn build_shell_source_prefix(shell: &str) -> &'static str {
  if shell.contains("zsh") {
    "test -f ~/.zshenv && source ~/.zshenv; \
     test -n \"$ZDOTDIR\" && test -f \"$ZDOTDIR/.zshrc\" && source \"$ZDOTDIR/.zshrc\" || \
     test -f ~/.zshrc && source ~/.zshrc"
  } else if shell.contains("bash") {
    "test -f ~/.bash_profile && source ~/.bash_profile || \
     test -f ~/.bashrc && source ~/.bashrc"
  } else {
    ""
  }
}

/// 获取或初始化缓存的 shell 环境变量
fn get_shell_env() -> &'static Mutex<std::collections::HashMap<String, String>> {
  SHELL_ENV.get_or_init(|| {
    let shell = get_shell();
    let prefix = build_shell_source_prefix(&shell);

    // 构建命令：source 配置后打印所有环境变量
    let env_cmd = if prefix.is_empty() {
      "env".to_string()
    } else {
      format!("{}; env", prefix)
    };

    let mut env_map = std::collections::HashMap::new();

    if let Ok(output) = Command::new(&shell)
      .arg("-l")
      .arg("-c")
      .arg(&env_cmd)
      .env("NONINTERACTIVE", "1")
      .output()
    {
      if output.status.success() {
        let env_output = String::from_utf8_lossy(&output.stdout);
        for line in env_output.lines() {
          if let Some((key, value)) = line.split_once('=') {
            env_map.insert(key.to_string(), value.to_string());
          }
        }
      }
    }

    // 如果没有获取到环境变量，至少包含当前的 PATH
    if env_map.is_empty() {
      if let Ok(path) = std::env::var("PATH") {
        env_map.insert("PATH".to_string(), path);
      }
    }

    Mutex::new(env_map)
  })
}

/// 在 shell 中执行命令并返回输出（使用缓存的环境变量）
fn run_in_shell(shell_command: &str) -> Result<std::process::Output, std::io::Error> {
  log::trace!("Running shell command: {}", shell_command);

  let env_lock = get_shell_env();
  let env_map = env_lock.lock().unwrap();

  let shell = get_shell();

  let mut cmd = Command::new(&shell);
  cmd.arg("-l").arg("-c").arg(shell_command);

  // 使用缓存的环境变量
  for (key, value) in env_map.iter() {
    cmd.env(key, value);
  }

  cmd.env("NONINTERACTIVE", "1");

  let start = std::time::Instant::now();
  let result = cmd.output();
  let elapsed = start.elapsed();

  match &result {
    Ok(output) => {
      log::trace!(
        "Shell command completed in {:?}, exit code: {:?}, stdout bytes: {}, stderr bytes: {}",
        elapsed,
        output.status.code(),
        output.stdout.len(),
        output.stderr.len()
      );
    }
    Err(e) => {
      log::error!("Shell command failed in {:?}: {}", elapsed, e);
    }
  }

  result
}

/// 从用户的 shell 获取 PATH 环境变量
/// 显式加载 shell 配置文件
fn get_shell_path() -> &'static str {
  SHELL_PATH.get_or_init(|| {
    let output = run_in_shell("echo $PATH");

    match output {
      Ok(output) if output.status.success() => {
        let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !path.is_empty() {
          return path;
        }
        std::env::var("PATH")
          .unwrap_or_else(|_| "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin".to_string())
      }
      _ => std::env::var("PATH")
        .unwrap_or_else(|_| "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin".to_string()),
    }
  })
}

/// 获取包管理器命令的完整路径
/// 优先级：1. 用户配置  2. 自动检测  3. 命令名回退
pub fn get_command_path(command: &str) -> PathBuf {
  log::debug!("Looking up command path for: {}", command);

  // 1. 首先检查用户配置
  if let Ok(config) = AppConfig::load() {
    if let Some(path) = config.get_command_path(command) {
      if path.exists() {
        log::debug!("Found command '{}' in user config: {:?}", command, path);
        return path;
      } else {
        log::warn!(
          "Configured path for '{}' does not exist: {:?}",
          command,
          path
        );
      }
    }
  }

  // 2. 尝试使用 which 命令自动检测
  let which_cmd = format!("which {}", command);
  if let Ok(output) = run_in_shell(&which_cmd) {
    if output.status.success() {
      let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
      if !path_str.is_empty() && PathBuf::from(&path_str).exists() {
        log::debug!("Found command '{}' via which: {}", command, path_str);
        return PathBuf::from(path_str);
      }
    }
  }

  // 如果 which 失败，手动在 PATH 中搜索
  let shell_path = get_shell_path();
  for dir in shell_path.split(':') {
    if dir.is_empty() {
      continue;
    }
    let full_path = PathBuf::from(dir).join(command);
    if full_path.exists() {
      log::debug!("Found command '{}' in PATH: {:?}", command, full_path);
      return full_path;
    }
  }

  // 3. 最后回退到直接使用命令名
  log::debug!(
    "Command '{}' not found, using command name as fallback",
    command
  );
  PathBuf::from(command)
}

/// 通过 shell 执行命令，确保继承完整环境变量
/// 这对于 npm, pnpm 等依赖环境变量的命令很重要
fn execute_with_shell(
  command: &str,
  args: &[&str],
) -> Result<std::process::Output, std::io::Error> {
  // 构建完整命令
  let mut full_cmd = String::from(command);
  for arg in args {
    full_cmd.push(' ');
    // 如果参数包含空格，需要引号
    if arg.contains(' ') {
      full_cmd.push_str(&format!("\"{}\"", arg));
    } else {
      full_cmd.push_str(arg);
    }
  }

  run_in_shell(&full_cmd)
}

/// 检查 Homebrew 包的安装状态
pub fn check_brew_installed() -> Result<HashSet<String>, String> {
  log::debug!("Checking Homebrew installed packages");

  let output = execute_with_shell("brew", &["list", "--formula"]).map_err(|e| {
    log::error!("Failed to run brew list: {}", e);
    format!("Failed to run brew: {}", e)
  })?;

  if !output.status.success() {
    log::warn!("brew list returned non-zero exit code");
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let installed: HashSet<String> = stdout
    .lines()
    .map(|s| s.trim().to_string())
    .filter(|s| !s.is_empty())
    .collect();

  log::debug!("Found {} Homebrew packages installed", installed.len());
  Ok(installed)
}

/// 检查 Homebrew Cask 包的安装状态
pub fn check_brew_cask_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("brew", &["list", "--cask"])
    .map_err(|e| format!("Failed to run brew: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let installed: HashSet<String> = stdout
    .lines()
    .map(|s| s.trim().to_string())
    .filter(|s| !s.is_empty())
    .collect();

  Ok(installed)
}

/// 检查 npm 全局包的安装状态
pub fn check_npm_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("npm", &["list", "-g", "--depth=0", "--json"])
    .map_err(|e| format!("Failed to run npm: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let json: serde_json::Value =
    serde_json::from_str(&stdout).map_err(|e| format!("Failed to parse npm output: {}", e))?;

  let mut installed = HashSet::new();
  if let Some(deps) = json.get("dependencies").and_then(|d| d.as_object()) {
    for (name, _) in deps {
      // 排除 npm 自己（但保留 corepack，因为用户可能需要它）
      if name != "npm" {
        installed.insert(name.clone());
      }
    }
  }

  Ok(installed)
}

/// 检查 pnpm 全局包的安装状态
pub fn check_pnpm_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("pnpm", &["list", "-g", "--depth=0"])
    .map_err(|e| format!("Failed to run pnpm: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let mut installed = HashSet::new();
  let mut in_dependencies = false;

  for line in stdout.lines() {
    if line.starts_with("dependencies:") {
      in_dependencies = true;
      continue;
    }

    if in_dependencies {
      // 依赖项行格式: "package-name version"
      if let Some(first_word) = line.split_whitespace().next() {
        // 跳过空行和分隔符
        if !first_word.is_empty() && !first_word.starts_with('/') {
          installed.insert(first_word.to_string());
        }
      }
    }
  }

  Ok(installed)
}

/// 检查 yarn 全局包的安装状态
pub fn check_yarn_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("yarn", &["global", "list", "--depth=0"])
    .map_err(|e| format!("Failed to run yarn: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let installed: HashSet<String> = stdout
    .lines()
    .filter_map(|line| {
      // yarn 输出格式: "info \"packagename@version\" has binaries:"
      if line.contains("info") && line.contains("@") {
        line
          .split('"')
          .nth(1)
          .and_then(|s| s.split('@').next())
          .map(|s| s.to_string())
      } else {
        None
      }
    })
    .collect();

  Ok(installed)
}

/// 检查 bun 全局包的安装状态
pub fn check_bun_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("bun", &["pm", "ls", "-g"])
    .map_err(|e| format!("Failed to run bun: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let mut installed = HashSet::new();

  for line in stdout.lines() {
    // bun 输出格式: "├── packagename@version" 或 "└── packagename@version"
    if line.contains("├──") || line.contains("└──") {
      // 分割并获取包名部分
      if let Some(after_tree) = line.split("──").nth(1) {
        let trimmed = after_tree.trim();
        // 处理版本号: packagename@version 或 @scope/packagename@version
        let pkg_name = if let Some(stripped) = trimmed.strip_prefix('@') {
          // Scoped package: @scope/packagename@version
          // 找到第二个 @ 符号的位置
          if let Some(second_at) = stripped.find('@') {
            &trimmed[..second_at + 1]
          } else {
            trimmed
          }
        } else {
          // Regular package: packagename@version
          trimmed.split('@').next().unwrap_or("")
        };

        if !pkg_name.is_empty() {
          installed.insert(pkg_name.to_string());
        }
      }
    }
  }

  Ok(installed)
}

/// 检查 cargo 包的安装状态
pub fn check_cargo_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("cargo", &["install", "--list"])
    .map_err(|e| format!("Failed to run cargo: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let installed: HashSet<String> = stdout
    .lines()
    .filter_map(|line| {
      // cargo 输出格式: "packagename v1.0.0:"
      if !line.starts_with(' ') && line.contains("v") {
        line.split_whitespace().next().map(|s| s.to_string())
      } else {
        None
      }
    })
    .collect();

  Ok(installed)
}

/// 检查 pip 包的安装状态
pub fn check_pip_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("pip", &["list", "--format=json"])
    .map_err(|e| format!("Failed to run pip: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let json: serde_json::Value =
    serde_json::from_str(&stdout).map_err(|e| format!("Failed to parse pip output: {}", e))?;

  let mut installed = HashSet::new();
  if let Some(packages) = json.as_array() {
    for pkg in packages {
      if let Some(name) = pkg.get("name").and_then(|n| n.as_str()) {
        installed.insert(name.to_string());
      }
    }
  }

  Ok(installed)
}

/// 检查 pipx 包的安装状态
pub fn check_pipx_installed() -> Result<HashSet<String>, String> {
  let output =
    execute_with_shell("pipx", &["list"]).map_err(|e| format!("Failed to run pipx: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let installed: HashSet<String> = stdout
    .lines()
    .filter_map(|line| {
      // pipx 输出格式: "   package packagename 1.0.0"
      if line.trim().starts_with("package") {
        line.split_whitespace().nth(1).map(|s| s.to_string())
      } else {
        None
      }
    })
    .collect();

  Ok(installed)
}

/// 检查 luarocks 包的安装状态
pub fn check_luarocks_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("luarocks", &["list"])
    .map_err(|e| format!("Failed to run luarocks: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let mut installed = HashSet::new();
  let mut in_list = false;

  for line in stdout.lines() {
    // 跳过标题行，直到看到 "---" 分隔符
    if line.contains("---") {
      in_list = true;
      continue;
    }

    if in_list && !line.trim().is_empty() {
      // luarocks 输出格式通常是包名开头，后面跟版本
      if let Some(pkg_name) = line.split_whitespace().next() {
        installed.insert(pkg_name.to_string());
      }
    }
  }

  Ok(installed)
}

/// 检查 go 包的安装状态
pub fn check_go_installed() -> Result<HashSet<String>, String> {
  // Go 1.18+ 不再支持 go list -m all 来列出全局安装的工具
  // 我们需要检查 $GOPATH/bin 目录
  let gopath = std::env::var("GOPATH").unwrap_or_else(|_| {
    let home = std::env::var("HOME").unwrap_or_default();
    format!("{}/go", home)
  });

  let bin_dir = std::path::Path::new(&gopath).join("bin");
  if !bin_dir.exists() {
    return Ok(HashSet::new());
  }

  let mut installed = HashSet::new();
  if let Ok(entries) = std::fs::read_dir(bin_dir) {
    for entry in entries.flatten() {
      if let Ok(file_name) = entry.file_name().into_string() {
        installed.insert(file_name);
      }
    }
  }

  Ok(installed)
}

/// 检查 uv 包的安装状态
pub fn check_uv_installed() -> Result<HashSet<String>, String> {
  let output = execute_with_shell("uv", &["pip", "list", "--format=json"])
    .map_err(|e| format!("Failed to run uv: {}", e))?;

  if !output.status.success() {
    return Ok(HashSet::new());
  }

  let stdout = String::from_utf8_lossy(&output.stdout);
  let json: serde_json::Value =
    serde_json::from_str(&stdout).map_err(|e| format!("Failed to parse uv output: {}", e))?;

  let mut installed = HashSet::new();
  if let Some(packages) = json.as_array() {
    for pkg in packages {
      if let Some(name) = pkg.get("name").and_then(|n| n.as_str()) {
        // 排除系统包 pip 和 setuptools
        if name != "pip" && name != "setuptools" {
          installed.insert(name.to_string());
        }
      }
    }
  }

  Ok(installed)
}

/// 根据包管理器名称检查已安装的包
pub fn check_installed_packages(manager: &str) -> Result<HashSet<String>, String> {
  log::debug!("Checking installed packages for: {}", manager);
  let start = std::time::Instant::now();

  let manager_type = PackageManagerType::from_str(manager).ok_or_else(|| {
    log::error!("Unknown package manager: {}", manager);
    format!("Unknown package manager: {}", manager)
  })?;

  let result = match manager_type {
    PackageManagerType::Brew => check_brew_installed(),
    PackageManagerType::BrewCask => check_brew_cask_installed(),
    PackageManagerType::Npm => check_npm_installed(),
    PackageManagerType::Pnpm => check_pnpm_installed(),
    PackageManagerType::Yarn => check_yarn_installed(),
    PackageManagerType::Bun => check_bun_installed(),
    PackageManagerType::Cargo => check_cargo_installed(),
    PackageManagerType::Pip => check_pip_installed(),
    PackageManagerType::Pipx => check_pipx_installed(),
    PackageManagerType::Luarocks => check_luarocks_installed(),
    PackageManagerType::Go => check_go_installed(),
    PackageManagerType::Uv => check_uv_installed(),
  };

  let elapsed = start.elapsed();
  match &result {
    Ok(packages) => log::debug!(
      "Checked installed packages for {} in {:?}, found {} packages",
      manager,
      elapsed,
      packages.len()
    ),
    Err(e) => log::error!(
      "Failed to check installed packages for {} in {:?}: {}",
      manager,
      elapsed,
      e
    ),
  }

  result
}
