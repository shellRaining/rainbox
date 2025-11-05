use crate::utils::get_dotfiles_root;
use std::path::PathBuf;

/// 路径辅助工具，统一管理所有路径构建逻辑
pub struct PathHelper;

impl PathHelper {
  /// 获取 packages 目录
  pub fn packages_dir() -> PathBuf {
    get_dotfiles_root().join("packages")
  }

  /// 获取指定包管理器的配置文件路径
  pub fn package_file(manager: &str) -> PathBuf {
    Self::packages_dir().join(format!("{}.txt", manager))
  }

  /// 获取 scripts 目录
  pub fn scripts_dir() -> PathBuf {
    get_dotfiles_root().join("scripts")
  }

  /// 获取 package-sync.sh 脚本路径
  pub fn package_sync_script() -> PathBuf {
    Self::scripts_dir().join("package-sync.sh")
  }
}
