use std::process::Command;

/// 执行 package-sync.sh 脚本
pub fn execute_package_sync(command: &str, manager: Option<&str>) -> Result<String, String> {
  let script_path = super::parser::get_dotfiles_root()
    .join("scripts")
    .join("package-sync.sh");

  if !script_path.exists() {
    return Err(format!("Script not found: {:?}", script_path));
  }

  let mut cmd = Command::new("zsh");
  cmd.arg(&script_path).arg(command);

  if let Some(mgr) = manager {
    cmd.arg(mgr);
  }

  let output = cmd
    .output()
    .map_err(|e| format!("Failed to execute script: {}", e))?;

  if output.status.success() {
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
  } else {
    Err(String::from_utf8_lossy(&output.stderr).to_string())
  }
}

/// 导出 export-packages.sh 脚本
pub fn execute_export_packages() -> Result<String, String> {
  let script_path = super::parser::get_dotfiles_root()
    .join("scripts")
    .join("export-packages.sh");

  if !script_path.exists() {
    return Err(format!("Script not found: {:?}", script_path));
  }

  let output = Command::new("zsh")
    .arg(&script_path)
    .output()
    .map_err(|e| format!("Failed to execute script: {}", e))?;

  if output.status.success() {
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
  } else {
    Err(String::from_utf8_lossy(&output.stderr).to_string())
  }
}
