use crate::models::{DiffResult, Package, PackageManager};
use crate::operations::{OperationType, PackageOperation};
use crate::services::{DiagnosticService, ExportService, ManagerService, PackageService};

/// 获取所有包管理器的状态
#[tauri::command]
pub async fn get_managers_status() -> Result<Vec<PackageManager>, String> {
  ManagerService::get_all_status()
}

/// 获取指定包管理器的包列表
#[tauri::command]
pub async fn get_packages(manager: String) -> Result<Vec<Package>, String> {
  PackageService::get_packages(&manager)
}

/// 安装包
#[tauri::command]
pub async fn install_packages(
  app: tauri::AppHandle,
  window: tauri::Window,
  manager: Option<String>,
) -> Result<String, String> {
  PackageOperation::execute(app, window, OperationType::Install, manager).await
}

/// 更新包
#[tauri::command]
pub async fn update_packages(
  app: tauri::AppHandle,
  window: tauri::Window,
  manager: Option<String>,
) -> Result<String, String> {
  PackageOperation::execute(app, window, OperationType::Update, manager).await
}

/// 导出包列表
#[tauri::command]
pub async fn export_packages() -> Result<String, String> {
  ExportService::export_packages()
}

/// 查看所有包管理器的差异
#[tauri::command]
pub async fn get_diff() -> Result<Vec<DiffResult>, String> {
  PackageService::get_diff()
}

/// 初始化本地配置
#[tauri::command]
pub async fn init_local() -> Result<String, String> {
  ExportService::init_local()
}

/// 诊断命令：获取路径信息和包管理器命令测试
#[tauri::command]
pub async fn get_diagnostic_info() -> Result<serde_json::Value, String> {
  DiagnosticService::get_diagnostic_info()
}
