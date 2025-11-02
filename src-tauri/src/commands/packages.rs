use crate::constants::SUPPORTED_MANAGERS;
use crate::models::{DiffResult, Package, PackageManager};
use crate::utils::{check_installed_packages, get_dotfiles_root, read_package_list};
use std::collections::HashSet;
use tauri::Emitter;

fn is_command_missing_error(error: &str) -> bool {
  error.contains("No such file or directory") || error.contains("command not found")
}

/// 处理单个包管理器的状态
fn process_single_manager(
  manager_name: &str,
  packages_dir: &std::path::Path,
) -> Option<PackageManager> {
  let file_path = packages_dir.join(format!("{}.txt", manager_name));

  if !file_path.exists() {
    return None;
  }

  let packages_with_source =
    crate::utils::parser::read_package_list_with_source(&file_path).ok()?;

  let packages: Vec<String> = packages_with_source
    .into_iter()
    .map(|(name, _)| name)
    .collect();

  let installed_count = match check_installed_packages(manager_name) {
    Ok(installed_set) => packages
      .iter()
      .filter(|p| installed_set.contains(*p))
      .count(),
    Err(err) if is_command_missing_error(&err) => 0,
    Err(err) => {
      eprintln!(
        "Warning: Failed to check installed packages for {}: {}",
        manager_name, err
      );
      0
    }
  };

  Some(PackageManager {
    name: manager_name.to_string(),
    total: packages.len(),
    installed: installed_count,
    updates_available: 0, // TODO: 检查可用更新
  })
}

/// 获取所有包管理器的状态
#[tauri::command]
pub async fn get_managers_status() -> Result<Vec<PackageManager>, String> {
  let packages_dir = get_dotfiles_root().join("packages");

  let result: Vec<PackageManager> = SUPPORTED_MANAGERS
    .iter()
    .filter_map(|(manager_name, _)| process_single_manager(manager_name, &packages_dir))
    .collect();

  Ok(result)
}

/// 获取指定包管理器的包列表
#[tauri::command]
pub async fn get_packages(manager: String) -> Result<Vec<Package>, String> {
  let dotfiles_root = get_dotfiles_root();
  let packages_dir = dotfiles_root.join("packages");
  let file_path = packages_dir.join(format!("{}.txt", manager));

  if !file_path.exists() {
    return Err(format!("Package file not found for manager: {}", manager));
  }

  // 使用带来源信息的读取方法
  let packages_with_source = crate::utils::parser::read_package_list_with_source(&file_path)?;

  // 检查实际安装状态
  let installed_set = match check_installed_packages(&manager) {
    Ok(set) => set,
    Err(err) => {
      if is_command_missing_error(&err) {
        HashSet::new()
      } else {
        return Err(format!(
          "Failed to check installed packages for {}: {}",
          manager, err
        ));
      }
    }
  };

  let result: Vec<Package> = packages_with_source
    .into_iter()
    .map(|(name, is_local)| Package {
      name: name.clone(),
      manager: manager.clone(),
      installed: installed_set.contains(&name),
      version: None, // TODO: 获取版本
      is_local,      // 使用从文件读取的来源信息
    })
    .collect();

  Ok(result)
}

/// 安装包
#[tauri::command]
pub async fn install_packages(
  app: tauri::AppHandle,
  window: tauri::Window,
  manager: Option<String>,
) -> Result<String, String> {
  use tauri_plugin_shell::process::CommandEvent;
  use tauri_plugin_shell::ShellExt;

  let dotfiles_root = get_dotfiles_root();
  let script_path = dotfiles_root.join("scripts").join("package-sync.sh");

  if !script_path.exists() {
    return Err(format!("Script not found: {:?}", script_path));
  }

  let mut args = vec!["install".to_string()];
  if let Some(mgr) = manager {
    args.push(mgr);
  }

  let (mut rx, mut _child) = app
    .shell()
    .command("zsh")
    .args(&[script_path.to_string_lossy().to_string()])
    .args(&args)
    .spawn()
    .map_err(|e| format!("Failed to spawn command: {}", e))?;

  // 实时推送输出到前端
  tauri::async_runtime::spawn(async move {
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout(line) => {
          let _ = window.emit("install-progress", line);
        }
        CommandEvent::Stderr(line) => {
          let _ = window.emit("install-error", line);
        }
        CommandEvent::Terminated(_) => {
          let _ = window.emit("install-complete", "Installation finished");
        }
        _ => {}
      }
    }
  });

  Ok("Installation started".to_string())
}

/// 更新包
#[tauri::command]
pub async fn update_packages(
  app: tauri::AppHandle,
  window: tauri::Window,
  manager: Option<String>,
) -> Result<String, String> {
  use tauri_plugin_shell::process::CommandEvent;
  use tauri_plugin_shell::ShellExt;

  let dotfiles_root = get_dotfiles_root();
  let script_path = dotfiles_root.join("scripts").join("package-sync.sh");

  if !script_path.exists() {
    return Err(format!("Script not found: {:?}", script_path));
  }

  let mut args = vec!["update".to_string()];
  if let Some(mgr) = manager {
    args.push(mgr);
  }

  let (mut rx, mut _child) = app
    .shell()
    .command("zsh")
    .args(&[script_path.to_string_lossy().to_string()])
    .args(&args)
    .spawn()
    .map_err(|e| format!("Failed to spawn command: {}", e))?;

  // 实时推送输出到前端
  tauri::async_runtime::spawn(async move {
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout(line) => {
          let _ = window.emit("update-progress", line);
        }
        CommandEvent::Stderr(line) => {
          let _ = window.emit("update-error", line);
        }
        CommandEvent::Terminated(_) => {
          let _ = window.emit("update-complete", "Update finished");
        }
        _ => {}
      }
    }
  });

  Ok("Update started".to_string())
}

/// 导出包列表
#[tauri::command]
pub async fn export_packages() -> Result<String, String> {
  use crate::utils::executor;
  executor::execute_export_packages()
}

/// 查看所有包管理器的差异
#[tauri::command]
pub async fn get_diff() -> Result<Vec<DiffResult>, String> {
  let packages_dir = get_dotfiles_root().join("packages");

  let mut results = Vec::new();

  for (manager_name, display_name) in SUPPORTED_MANAGERS {
    let file_path = packages_dir.join(format!("{}.txt", manager_name));

    if !file_path.exists() {
      continue;
    }

    // 读取配置文件中的包列表
    let declared_packages = match read_package_list(&file_path) {
      Ok(packages) => packages,
      Err(_) => continue,
    };
    let declared_set: HashSet<String> = declared_packages.into_iter().collect();

    // 获取实际已安装的包
    let installed_set = check_installed_packages(manager_name).unwrap_or_default();

    // 计算差异
    let to_install: Vec<String> = declared_set.difference(&installed_set).cloned().collect();

    let to_remove: Vec<String> = installed_set.difference(&declared_set).cloned().collect();

    results.push(DiffResult {
      name: manager_name.to_string(),
      display_name: display_name.to_string(),
      to_install,
      to_remove,
    });
  }

  Ok(results)
}

/// 初始化本地配置
#[tauri::command]
pub async fn init_local() -> Result<String, String> {
  use crate::utils::executor;
  executor::execute_package_sync("init-local", None)
}

/// 诊断命令：获取路径信息和包管理器命令测试
#[tauri::command]
pub async fn get_diagnostic_info() -> Result<serde_json::Value, String> {
  use crate::utils::checker;

  let dotfiles_root = get_dotfiles_root();
  let packages_dir = dotfiles_root.join("packages");

  let mut file_info = serde_json::Map::new();

  // 检查每个管理器的文件
  for (manager, _) in SUPPORTED_MANAGERS {
    let file_path = packages_dir.join(format!("{}.txt", manager));
    file_info.insert(
      manager.to_string(),
      serde_json::json!({
        "path": file_path.to_string_lossy(),
        "exists": file_path.exists(),
      }),
    );
  }

  // 测试从 shell 获取 PATH
  let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());
  let shell_path_output = std::process::Command::new(&shell)
    .arg("-l")
    .arg("-c")
    .arg("echo $PATH")
    .output();

  let shell_path_result = match &shell_path_output {
    Ok(output) if output.status.success() => {
      String::from_utf8_lossy(&output.stdout).trim().to_string()
    }
    Ok(output) => format!("Command failed with status: {}", output.status),
    Err(e) => format!("Failed to execute: {}", e),
  };

  // 常用命令列表（用于诊断测试）
  let common_commands = ["brew", "npm", "pnpm", "cargo", "pip"];

  // 测试 which 命令查找结果
  let mut which_results = serde_json::Map::new();
  for cmd in &common_commands {
    let which_output = std::process::Command::new(&shell)
      .arg("-l")
      .arg("-c")
      .arg(format!("which {}", cmd))
      .output();

    let result = match &which_output {
      Ok(output) if output.status.success() => {
        String::from_utf8_lossy(&output.stdout).trim().to_string()
      }
      Ok(output) => format!("Not found (exit: {})", output.status),
      Err(e) => format!("Error: {}", e),
    };

    which_results.insert(cmd.to_string(), serde_json::json!(result));
  }

  // 测试每个包管理器命令是否可用（使用我们的 get_command_path）
  let mut command_tests = serde_json::Map::new();

  for cmd in &common_commands {
    let cmd_path = checker::get_command_path_for_diagnostic(cmd);
    command_tests.insert(
      cmd.to_string(),
      serde_json::json!({
        "resolved_path": cmd_path.to_string_lossy(),
        "exists": cmd_path.exists(),
      }),
    );
  }

  // 测试实际的包检测
  let mut package_check_results = serde_json::Map::new();
  for (manager, _) in SUPPORTED_MANAGERS {
    let result = check_installed_packages(manager);
    package_check_results.insert(
      manager.to_string(),
      serde_json::json!({
        "success": result.is_ok(),
        "count": result.as_ref().ok().map(|set| set.len()).unwrap_or(0),
        "error": result.as_ref().err().map(|e| e.to_string()),
        "sample_packages": result.ok().and_then(|set| {
          let packages: Vec<String> = set.into_iter().take(5).collect();
          if packages.is_empty() { None } else { Some(packages) }
        }),
      }),
    );
  }

  Ok(serde_json::json!({
    "dotfiles_root": dotfiles_root.to_string_lossy(),
    "packages_dir": packages_dir.to_string_lossy(),
    "packages_dir_exists": packages_dir.exists(),
    "home_env": std::env::var("HOME").unwrap_or_default(),
    "dotfiles_root_env": std::env::var("DOTFILES_ROOT").ok(),
    "shell_env": shell,
    "path_env": std::env::var("PATH").unwrap_or_default(),
    "shell_path": shell_path_result,
    "which_results": which_results,
    "files": file_info,
    "command_tests": command_tests,
    "package_checks": package_check_results,
  }))
}
