// Declare modules
mod cache;
mod commands;
mod constants;
mod models;
mod operations;
mod services;
mod utils;

use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Generate log filename with current date (without .log extension, tauri-plugin-log will add it)
      let log_filename = format!("rainbox-{}", chrono::Local::now().format("%Y-%m-%d"));

      // Set log level based on build type
      let log_level = if cfg!(debug_assertions) {
        log::LevelFilter::Debug
      } else {
        log::LevelFilter::Info
      };

      app.handle().plugin(
        tauri_plugin_log::Builder::default()
          .level(log_level)
          .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir {
              file_name: Some(log_filename.clone()),
            }),
          ])
          .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
          .build(),
      )?;

      log::info!("=== Application initialization started ===");
      log::info!("Log level: {:?}", log_level);
      log::info!("Platform: {}", std::env::consts::OS);

      // Get actual log directory from tauri app handle
      if let Ok(log_dir) = app.path().app_log_dir() {
        log::info!("Log directory: {:?}", log_dir);
        log::info!(
          "Log file: {:?}",
          log_dir.join(format!("{}.log", log_filename))
        );

        // Clean up old log files (keep last 7 days)
        utils::cleanup_old_logs(&log_dir, 7);
      } else {
        log::warn!("Failed to get log directory path");
      }

      log::info!("=== Application initialization completed ===");

      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      commands::get_managers_status,
      commands::get_packages,
      commands::install_packages,
      commands::get_diff,
      commands::get_config,
      commands::save_config,
      commands::set_command_path,
      commands::auto_detect_commands,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
