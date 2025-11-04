use crate::constants::SUPPORTED_MANAGERS;
use crate::utils::{check_installed_packages, get_dotfiles_root, PathHelper};
use serde_json::{json, Value};
use std::collections::HashMap;

pub struct DiagnosticService;

impl DiagnosticService {
  /// 获取诊断信息
  pub fn get_diagnostic_info() -> Result<Value, String> {
    let dotfiles_root = get_dotfiles_root();
    let packages_dir = PathHelper::packages_dir();

    let file_info = Self::get_file_info(&packages_dir);
    let shell_info = Self::get_shell_info();
    let command_tests = Self::test_commands();
    let package_checks = Self::check_packages();

    Ok(json!({
      "dotfiles_root": dotfiles_root.to_string_lossy(),
      "packages_dir": packages_dir.to_string_lossy(),
      "packages_dir_exists": packages_dir.exists(),
      "home_env": std::env::var("HOME").unwrap_or_default(),
      "dotfiles_root_env": std::env::var("DOTFILES_ROOT").ok(),
      "shell_env": shell_info.shell,
      "path_env": std::env::var("PATH").unwrap_or_default(),
      "shell_path": shell_info.shell_path,
      "which_results": shell_info.which_results,
      "files": file_info,
      "command_tests": command_tests,
      "package_checks": package_checks,
    }))
  }

  /// 获取文件信息
  fn get_file_info(_packages_dir: &std::path::Path) -> HashMap<String, Value> {
    let mut file_info = HashMap::new();

    for (manager, _) in SUPPORTED_MANAGERS {
      let file_path = PathHelper::package_file(manager);
      file_info.insert(
        manager.to_string(),
        json!({
          "path": file_path.to_string_lossy(),
          "exists": file_path.exists(),
        }),
      );
    }

    file_info
  }

  /// 获取 shell 相关信息
  fn get_shell_info() -> ShellInfo {
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());

    // 测试从 shell 获取 PATH
    let shell_path_output = std::process::Command::new(&shell)
      .arg("-l")
      .arg("-c")
      .arg("echo $PATH")
      .output();

    let shell_path = match &shell_path_output {
      Ok(output) if output.status.success() => {
        String::from_utf8_lossy(&output.stdout).trim().to_string()
      }
      Ok(output) => format!("Command failed with status: {}", output.status),
      Err(e) => format!("Failed to execute: {}", e),
    };

    // 常用命令列表
    let common_commands = ["brew", "npm", "pnpm", "cargo", "pip"];
    let which_results = Self::test_which_commands(&shell, &common_commands);

    ShellInfo {
      shell,
      shell_path,
      which_results,
    }
  }

  /// 测试 which 命令
  fn test_which_commands(shell: &str, commands: &[&str]) -> HashMap<String, Value> {
    let mut which_results = HashMap::new();

    for cmd in commands {
      let which_output = std::process::Command::new(shell)
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

      which_results.insert(cmd.to_string(), json!(result));
    }

    which_results
  }

  /// 测试命令路径
  fn test_commands() -> HashMap<String, Value> {
    use crate::utils::checker;

    let common_commands = ["brew", "npm", "pnpm", "cargo", "pip"];
    let mut command_tests = HashMap::new();

    for cmd in &common_commands {
      let cmd_path = checker::get_command_path_for_diagnostic(cmd);
      command_tests.insert(
        cmd.to_string(),
        json!({
          "resolved_path": cmd_path.to_string_lossy(),
          "exists": cmd_path.exists(),
        }),
      );
    }

    command_tests
  }

  /// 检查包管理器
  fn check_packages() -> HashMap<String, Value> {
    let mut package_check_results = HashMap::new();

    for (manager, _) in SUPPORTED_MANAGERS {
      let result = check_installed_packages(manager);
      package_check_results.insert(
        manager.to_string(),
        json!({
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

    package_check_results
  }
}

struct ShellInfo {
  shell: String,
  shell_path: String,
  which_results: HashMap<String, Value>,
}
