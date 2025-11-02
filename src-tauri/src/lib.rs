// Declare modules
mod commands;
mod constants;
mod models;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      commands::get_managers_status,
      commands::get_packages,
      commands::install_packages,
      commands::update_packages,
      commands::export_packages,
      commands::get_diff,
      commands::init_local,
      commands::get_diagnostic_info,
      commands::get_config,
      commands::save_config,
      commands::set_command_path,
      commands::auto_detect_commands,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
