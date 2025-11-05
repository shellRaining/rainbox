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
  use crate::constants::PackageManagerType;
  use crate::utils::checker;
  use futures::future::join_all;

  let commands: Vec<&str> = PackageManagerType::all().iter().map(|pm| pm.id()).collect();

  let tasks: Vec<_> = commands
    .into_iter()
    .map(|cmd| async move {
      let path = checker::get_command_path(cmd);
      if path.exists() && path != std::path::PathBuf::from(cmd) {
        Some((cmd.to_string(), path.to_string_lossy().to_string()))
      } else {
        None
      }
    })
    .collect();

  let results = join_all(tasks).await;
  let detected: HashMap<String, String> = results.into_iter().filter_map(|x| x).collect();

  Ok(detected)
}
