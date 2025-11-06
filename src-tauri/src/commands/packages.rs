use crate::models::{DiffResult, Package, PackageManager};
use crate::operations::{OperationType, PackageOperation};
use crate::services::{ManagerService, PackageService};

/// 获取所有包管理器的状态
#[tauri::command]
pub async fn get_managers_status() -> Result<Vec<PackageManager>, String> {
  let start = std::time::Instant::now();
  log::info!("Command 'get_managers_status' started");

  let result = ManagerService::get_all_status();

  let elapsed = start.elapsed();
  match &result {
    Ok(managers) => log::info!(
      "Command 'get_managers_status' completed in {:?}, found {} managers",
      elapsed,
      managers.len()
    ),
    Err(e) => log::error!(
      "Command 'get_managers_status' failed in {:?}: {}",
      elapsed,
      e
    ),
  }

  result
}

/// 获取指定包管理器的包列表
#[tauri::command]
pub async fn get_packages(manager: String) -> Result<Vec<Package>, String> {
  let start = std::time::Instant::now();
  log::info!("Command 'get_packages' started for manager: {}", manager);

  let result = PackageService::get_packages(&manager);

  let elapsed = start.elapsed();
  match &result {
    Ok(packages) => log::info!(
      "Command 'get_packages' completed in {:?}, found {} packages for {}",
      elapsed,
      packages.len(),
      manager
    ),
    Err(e) => log::error!(
      "Command 'get_packages' failed in {:?} for {}: {}",
      elapsed,
      manager,
      e
    ),
  }

  result
}

/// 安装包
#[tauri::command]
pub async fn install_packages(
  app: tauri::AppHandle,
  window: tauri::Window,
  manager: Option<String>,
) -> Result<String, String> {
  let start = std::time::Instant::now();
  log::info!(
    "Command 'install_packages' started for manager: {:?}",
    manager
  );

  let result =
    PackageOperation::execute(app, window, OperationType::Install, manager.clone()).await;

  let elapsed = start.elapsed();
  match &result {
    Ok(msg) => log::info!(
      "Command 'install_packages' completed in {:?} for {:?}: {}",
      elapsed,
      manager,
      msg
    ),
    Err(e) => log::error!(
      "Command 'install_packages' failed in {:?} for {:?}: {}",
      elapsed,
      manager,
      e
    ),
  }

  result
}

/// 查看所有包管理器的差异
#[tauri::command]
pub async fn get_diff() -> Result<Vec<DiffResult>, String> {
  let start = std::time::Instant::now();
  log::info!("Command 'get_diff' started");

  let result = PackageService::get_diff();

  let elapsed = start.elapsed();
  match &result {
    Ok(diffs) => log::info!(
      "Command 'get_diff' completed in {:?}, found {} manager diffs",
      elapsed,
      diffs.len()
    ),
    Err(e) => log::error!("Command 'get_diff' failed in {:?}: {}", elapsed, e),
  }

  result
}
