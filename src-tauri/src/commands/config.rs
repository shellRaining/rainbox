use crate::models::AppConfig;
use std::collections::HashMap;

#[tauri::command]
pub async fn get_config() -> Result<AppConfig, String> {
  let start = std::time::Instant::now();
  log::info!("Command 'get_config' started");

  let result = AppConfig::load();

  let elapsed = start.elapsed();
  match &result {
    Ok(_) => log::info!("Command 'get_config' completed in {:?}", elapsed),
    Err(e) => log::error!("Command 'get_config' failed in {:?}: {}", elapsed, e),
  }

  result
}

#[tauri::command]
pub async fn save_config(config: AppConfig) -> Result<(), String> {
  let start = std::time::Instant::now();
  log::info!("Command 'save_config' started");

  let result = config.save();

  let elapsed = start.elapsed();
  match &result {
    Ok(_) => log::info!("Command 'save_config' completed in {:?}", elapsed),
    Err(e) => log::error!("Command 'save_config' failed in {:?}: {}", elapsed, e),
  }

  result
}

#[tauri::command]
pub async fn set_command_path(command: String, path: String) -> Result<(), String> {
  let start = std::time::Instant::now();
  log::info!(
    "Command 'set_command_path' started: {} -> {}",
    command,
    path
  );

  let mut config = AppConfig::load()?;
  config.set_command_path(command.clone(), path.clone());
  let result = config.save();

  let elapsed = start.elapsed();
  match &result {
    Ok(_) => log::info!(
      "Command 'set_command_path' completed in {:?}: {} -> {}",
      elapsed,
      command,
      path
    ),
    Err(e) => log::error!("Command 'set_command_path' failed in {:?}: {}", elapsed, e),
  }

  result
}

#[tauri::command]
pub async fn auto_detect_commands() -> Result<HashMap<String, String>, String> {
  use crate::constants::PackageManagerType;
  use crate::utils::checker;
  use futures::future::join_all;

  let start = std::time::Instant::now();
  log::info!("Command 'auto_detect_commands' started");

  let commands: Vec<&str> = PackageManagerType::all().iter().map(|pm| pm.id()).collect();

  let tasks: Vec<_> = commands
    .into_iter()
    .map(|cmd| async move {
      let path = checker::get_command_path(cmd);
      if path.exists() && path != std::path::PathBuf::from(cmd) {
        log::debug!("Detected command '{}' at: {:?}", cmd, path);
        Some((cmd.to_string(), path.to_string_lossy().to_string()))
      } else {
        log::debug!("Command '{}' not found or using default path", cmd);
        None
      }
    })
    .collect();

  let results = join_all(tasks).await;
  let detected: HashMap<String, String> = results.into_iter().filter_map(|x| x).collect();

  let elapsed = start.elapsed();
  log::info!(
    "Command 'auto_detect_commands' completed in {:?}, detected {} commands",
    elapsed,
    detected.len()
  );

  Ok(detected)
}
