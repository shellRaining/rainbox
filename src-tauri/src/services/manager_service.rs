use crate::constants::SUPPORTED_MANAGERS;
use crate::models::PackageManager;
use crate::utils::{check_installed_packages, is_command_missing_error, read_packages};

pub struct ManagerService;

impl ManagerService {
  /// 处理单个包管理器的状态
  pub fn get_status(manager_name: &str) -> Option<PackageManager> {
    let packages = read_packages(manager_name).ok()?;

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
  pub fn get_all_status() -> Result<Vec<PackageManager>, String> {
    let result: Vec<PackageManager> = SUPPORTED_MANAGERS
      .iter()
      .filter_map(|(manager_name, _)| Self::get_status(manager_name))
      .collect();

    Ok(result)
  }
}
