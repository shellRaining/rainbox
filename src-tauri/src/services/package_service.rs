use crate::cache::PackageCache;
use crate::constants::SUPPORTED_MANAGERS;
use crate::models::{DiffResult, Package};
use crate::utils::{
  check_installed_packages, is_command_missing_error, package_file_exists, read_package_list,
  read_packages_with_source, PathHelper,
};
use std::collections::HashSet;
use std::sync::OnceLock;

// 全局缓存实例
static INSTALLED_CACHE: OnceLock<PackageCache<HashSet<String>>> = OnceLock::new();

fn get_cache() -> &'static PackageCache<HashSet<String>> {
  INSTALLED_CACHE.get_or_init(|| PackageCache::new(10))
}

pub struct PackageService;

impl PackageService {
  /// 获取指定包管理器的包列表
  pub fn get_packages(manager: &str) -> Result<Vec<Package>, String> {
    log::debug!("Getting package list for: {}", manager);

    let packages_with_source = read_packages_with_source(manager)?;
    log::debug!(
      "Read {} packages with source info for {}",
      packages_with_source.len(),
      manager
    );

    // 尝试从缓存获取已安装包列表
    let cache = get_cache();
    let cache_key = format!("installed_{}", manager);

    let installed_set = if let Some(cached) = cache.get(&cache_key) {
      log::debug!("Using cached installed packages for {}", manager);
      cached
    } else {
      // 检查实际安装状态
      match check_installed_packages(manager) {
        Ok(set) => {
          log::debug!("Found {} installed packages for {}", set.len(), manager);
          // 存入缓存
          cache.set(cache_key, set.clone());
          set
        }
        Err(err) => {
          if is_command_missing_error(&err) {
            log::warn!(
              "Command not found for {}, assuming no packages installed",
              manager
            );
            HashSet::new()
          } else {
            log::error!(
              "Failed to check installed packages for {}: {}",
              manager,
              err
            );
            return Err(format!(
              "Failed to check installed packages for {}: {}",
              manager, err
            ));
          }
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

    log::info!(
      "Successfully retrieved {} packages for {}",
      result.len(),
      manager
    );
    Ok(result)
  }

  /// 查看所有包管理器的差异
  pub fn get_diff() -> Result<Vec<DiffResult>, String> {
    log::info!("Calculating package differences for all managers");
    let mut results = Vec::new();

    for (manager_name, display_name) in SUPPORTED_MANAGERS {
      if !package_file_exists(manager_name) {
        log::debug!("Package file does not exist for {}, skipping", manager_name);
        continue;
      }

      // 读取配置文件中的包列表
      let declared_packages = match read_package_list(&PathHelper::package_file(manager_name)) {
        Ok(packages) => {
          log::debug!(
            "Read {} declared packages for {}",
            packages.len(),
            manager_name
          );
          packages
        }
        Err(e) => {
          log::warn!("Failed to read package list for {}: {}", manager_name, e);
          continue;
        }
      };
      let declared_set: HashSet<String> = declared_packages.into_iter().collect();

      // 获取实际已安装的包
      let installed_set = match check_installed_packages(manager_name) {
        Ok(set) => {
          log::debug!(
            "Found {} installed packages for {}",
            set.len(),
            manager_name
          );
          set
        }
        Err(e) => {
          log::warn!(
            "Failed to check installed packages for {}: {}",
            manager_name,
            e
          );
          HashSet::new()
        }
      };

      // 计算差异
      let to_install: Vec<String> = declared_set.difference(&installed_set).cloned().collect();
      let to_remove: Vec<String> = installed_set.difference(&declared_set).cloned().collect();

      log::debug!(
        "Diff for {}: {} to install, {} to remove",
        manager_name,
        to_install.len(),
        to_remove.len()
      );

      results.push(DiffResult {
        name: manager_name.to_string(),
        display_name: display_name.to_string(),
        to_install,
        to_remove,
      });
    }

    log::info!("Calculated differences for {} managers", results.len());
    Ok(results)
  }
}
