use crate::utils::{read_package_list_with_source, PathHelper};

/// 读取包管理器的包列表（带来源信息）
/// 返回 Vec<(包名, 是否来自本地文件)>
pub fn read_packages_with_source(manager: &str) -> Result<Vec<(String, bool)>, String> {
  let file_path = PathHelper::package_file(manager);
  log::debug!(
    "Reading packages with source for '{}' from {:?}",
    manager,
    file_path
  );

  if !file_path.exists() {
    log::warn!("Package file not found for '{}': {:?}", manager, file_path);
    return Err(format!("Package file not found for manager: {}", manager));
  }

  let result = read_package_list_with_source(&file_path);
  match &result {
    Ok(packages) => log::debug!(
      "Successfully read {} packages for '{}' from {:?}",
      packages.len(),
      manager,
      file_path
    ),
    Err(e) => log::error!(
      "Failed to read packages for '{}' from {:?}: {}",
      manager,
      file_path,
      e
    ),
  }

  result
}

/// 读取包管理器的包列表（仅包名）
pub fn read_packages(manager: &str) -> Result<Vec<String>, String> {
  log::debug!("Reading package names for '{}'", manager);
  read_packages_with_source(manager)
    .map(|packages| packages.into_iter().map(|(name, _)| name).collect())
}

/// 检查包管理器的包文件是否存在
pub fn package_file_exists(manager: &str) -> bool {
  let file_path = PathHelper::package_file(manager);
  let exists = file_path.exists();
  log::trace!(
    "Package file exists check for '{}': {} ({:?})",
    manager,
    exists,
    file_path
  );
  exists
}
