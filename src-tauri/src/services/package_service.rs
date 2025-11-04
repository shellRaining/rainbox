use crate::constants::SUPPORTED_MANAGERS;
use crate::models::{DiffResult, Package};
use crate::utils::{
  check_installed_packages, is_command_missing_error, read_package_list,
  read_package_list_with_source, PathHelper,
};
use std::collections::HashSet;

pub struct PackageService;

impl PackageService {
  /// 获取指定包管理器的包列表
  pub fn get_packages(manager: &str) -> Result<Vec<Package>, String> {
    let file_path = PathHelper::package_file(manager);

    if !file_path.exists() {
      return Err(format!("Package file not found for manager: {}", manager));
    }

    // 使用带来源信息的读取方法
    let packages_with_source = read_package_list_with_source(&file_path)?;

    // 检查实际安装状态
    let installed_set = match check_installed_packages(manager) {
      Ok(set) => set,
      Err(err) => {
        if is_command_missing_error(&err) {
          HashSet::new()
        } else {
          return Err(format!(
            "Failed to check installed packages for {}: {}",
            manager, err
          ));
        }
      }
    };

    let result: Vec<Package> = packages_with_source
      .into_iter()
      .map(|(name, is_local)| Package {
        name: name.clone(),
        manager: manager.to_string(),
        installed: installed_set.contains(&name),
        version: None, // TODO: 获取版本
        is_local,      // 使用从文件读取的来源信息
      })
      .collect();

    Ok(result)
  }

  /// 查看所有包管理器的差异
  pub fn get_diff() -> Result<Vec<DiffResult>, String> {
    let packages_dir = PathHelper::packages_dir();

    let mut results = Vec::new();

    for (manager_name, display_name) in SUPPORTED_MANAGERS {
      let file_path = packages_dir.join(format!("{}.txt", manager_name));

      if !file_path.exists() {
        continue;
      }

      // 读取配置文件中的包列表
      let declared_packages = match read_package_list(&file_path) {
        Ok(packages) => packages,
        Err(_) => continue,
      };
      let declared_set: HashSet<String> = declared_packages.into_iter().collect();

      // 获取实际已安装的包
      let installed_set = check_installed_packages(manager_name).unwrap_or_default();

      // 计算差异
      let to_install: Vec<String> = declared_set.difference(&installed_set).cloned().collect();

      let to_remove: Vec<String> = installed_set.difference(&declared_set).cloned().collect();

      results.push(DiffResult {
        name: manager_name.to_string(),
        display_name: display_name.to_string(),
        to_install,
        to_remove,
      });
    }

    Ok(results)
  }
}
