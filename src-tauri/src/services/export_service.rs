use crate::utils::{executor, get_dotfiles_root};

pub struct ExportService;

impl ExportService {
  /// 导出包列表
  pub fn export_packages() -> Result<String, String> {
    executor::execute_export_packages()
  }

  /// 初始化本地配置
  pub fn init_local() -> Result<String, String> {
    executor::execute_package_sync("init-local", None)
  }

  /// 验证 dotfiles 环境
  #[allow(dead_code)]
  pub fn verify_environment() -> Result<(), String> {
    let dotfiles_root = get_dotfiles_root();
    let scripts_dir = dotfiles_root.join("scripts");

    if !scripts_dir.exists() {
      return Err(format!("Scripts directory not found: {:?}", scripts_dir));
    }

    let package_sync = scripts_dir.join("package-sync.sh");
    let export_packages = scripts_dir.join("export-packages.sh");

    if !package_sync.exists() {
      return Err(format!("package-sync.sh not found: {:?}", package_sync));
    }

    if !export_packages.exists() {
      return Err(format!(
        "export-packages.sh not found: {:?}",
        export_packages
      ));
    }

    Ok(())
  }
}
