use crate::models::AppConfig;
use std::collections::HashMap;

#[tauri::command]
pub async fn get_config() -> Result<AppConfig, String> {
  AppConfig::load()
}

#[tauri::command]
pub async fn save_config(config: AppConfig) -> Result<(), String> {
  config.save()
}

#[tauri::command]
pub async fn set_command_path(command: String, path: String) -> Result<(), String> {
  let mut config = AppConfig::load()?;
  config.set_command_path(command, path);
  config.save()
}

#[tauri::command]
pub async fn auto_detect_commands() -> Result<HashMap<String, String>, String> {
  use crate::utils::checker;

  let commands = vec![
    "brew", "npm", "pnpm", "yarn", "bun", "cargo", "pip", "pipx", "go", "luarocks", "uv",
  ];

  let mut detected = HashMap::new();

  for cmd in commands {
    let path = checker::get_command_path_for_diagnostic(cmd);
    if path.exists() && path != std::path::PathBuf::from(cmd) {
      // 只保存找到完整路径的命令
      detected.insert(cmd.to_string(), path.to_string_lossy().to_string());
    }
  }

  Ok(detected)
}
