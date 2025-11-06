use crate::constants::SUPPORTED_MANAGERS;
use crate::models::PackageManager;
use crate::utils::{check_installed_packages, is_command_missing_error, read_packages};

pub struct ManagerService;

impl ManagerService {
  /// 处理单个包管理器的状态
  pub fn get_status(manager_name: &str) -> Option<PackageManager> {
    log::debug!("Getting status for package manager: {}", manager_name);

    let packages = match read_packages(manager_name) {
      Ok(pkgs) => {
        log::debug!("Read {} packages for {}", pkgs.len(), manager_name);
        pkgs
      }
      Err(e) => {
        log::warn!("Failed to read packages for {}: {}", manager_name, e);
        return None;
      }
    };

    let installed_count = match check_installed_packages(manager_name) {
      Ok(installed_set) => {
        let count = packages
          .iter()
          .filter(|p| installed_set.contains(*p))
          .count();
        log::debug!(
          "Package manager {} has {} installed out of {} total",
          manager_name,
          count,
          packages.len()
        );
        count
      }
      Err(err) if is_command_missing_error(&err) => {
        log::warn!("Command not found for {}", manager_name);
        0
      }
      Err(err) => {
        log::error!(
          "Failed to check installed packages for {}: {}",
          manager_name,
          err
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
    log::info!("Getting status for all package managers");

    let result: Vec<PackageManager> = SUPPORTED_MANAGERS
      .iter()
      .filter_map(|(manager_name, _)| Self::get_status(manager_name))
      .collect();

    log::info!(
      "Successfully retrieved status for {} managers",
      result.len()
    );
    Ok(result)
  }
}
