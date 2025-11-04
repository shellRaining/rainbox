use crate::constants::SUPPORTED_MANAGERS;
use crate::models::PackageManager;
use crate::utils::{check_installed_packages, get_dotfiles_root, read_package_list_with_source};
use std::path::Path;

pub struct ManagerService;

impl ManagerService {
  /// 处理单个包管理器的状态
  pub fn get_status(manager_name: &str, packages_dir: &Path) -> Option<PackageManager> {
    let file_path = packages_dir.join(format!("{}.txt", manager_name));

    if !file_path.exists() {
      return None;
    }

    let packages_with_source = read_package_list_with_source(&file_path).ok()?;

    let packages: Vec<String> = packages_with_source
      .into_iter()
      .map(|(name, _)| name)
      .collect();

    let installed_count = match check_installed_packages(manager_name) {
      Ok(installed_set) => packages
        .iter()
        .filter(|p| installed_set.contains(*p))
        .count(),
      Err(err) if Self::is_command_missing_error(&err) => 0,
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
    let packages_dir = get_dotfiles_root().join("packages");

    let result: Vec<PackageManager> = SUPPORTED_MANAGERS
      .iter()
      .filter_map(|(manager_name, _)| Self::get_status(manager_name, &packages_dir))
      .collect();

    Ok(result)
  }

  /// 检查是否是命令缺失错误
  fn is_command_missing_error(error: &str) -> bool {
    error.contains("No such file or directory") || error.contains("command not found")
  }
}
