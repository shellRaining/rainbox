use crate::utils::{read_package_list_with_source, PathHelper};

/// 读取包管理器的包列表（带来源信息）
/// 返回 Vec<(包名, 是否来自本地文件)>
pub fn read_packages_with_source(manager: &str) -> Result<Vec<(String, bool)>, String> {
  let file_path = PathHelper::package_file(manager);

  if !file_path.exists() {
    return Err(format!("Package file not found for manager: {}", manager));
  }

  read_package_list_with_source(&file_path)
}

/// 读取包管理器的包列表（仅包名）
pub fn read_packages(manager: &str) -> Result<Vec<String>, String> {
  read_packages_with_source(manager)
    .map(|packages| packages.into_iter().map(|(name, _)| name).collect())
}

/// 检查包管理器的包文件是否存在
pub fn package_file_exists(manager: &str) -> bool {
  PathHelper::package_file(manager).exists()
}
