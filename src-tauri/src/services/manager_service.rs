use crate::cache::PackageCache;
use crate::constants::SUPPORTED_MANAGERS;
use crate::models::PackageManager;
use crate::utils::{check_installed_packages, is_command_missing_error, read_packages};
use std::collections::HashSet;
use std::sync::OnceLock;

// 全局缓存实例，TTL 为 10 秒
static INSTALLED_CACHE: OnceLock<PackageCache<HashSet<String>>> = OnceLock::new();

fn get_cache() -> &'static PackageCache<HashSet<String>> {
  INSTALLED_CACHE.get_or_init(|| {
    log::info!("Initializing package cache with 10 second TTL");
    PackageCache::new(10)
  })
}

pub struct ManagerService;

impl ManagerService {
  /// 处理单个包管理器的状态 (异步版本)
  async fn get_status_async(manager_name: &str) -> Option<PackageManager> {
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

    // 尝试从缓存获取
    let cache = get_cache();
    let cache_key = format!("installed_{}", manager_name);

    let installed_set = if let Some(cached) = cache.get(&cache_key) {
      log::debug!("Using cached installed packages for {}", manager_name);
      cached
    } else {
      // 缓存未命中，执行实际检查
      match check_installed_packages(manager_name) {
        Ok(set) => {
          log::debug!("Checked {} installed packages for {}", set.len(), manager_name);
          // 存入缓存
          cache.set(cache_key, set.clone());
          set
        }
        Err(err) if is_command_missing_error(&err) => {
          log::warn!("Command not found for {}", manager_name);
          HashSet::new()
        }
        Err(err) => {
          log::error!(
            "Failed to check installed packages for {}: {}",
            manager_name,
            err
          );
          HashSet::new()
        }
      }
    };

    let installed_count = packages
      .iter()
      .filter(|p| installed_set.contains(*p))
      .count();

    log::debug!(
      "Package manager {} has {} installed out of {} total",
      manager_name,
      installed_count,
      packages.len()
    );

    Some(PackageManager {
      name: manager_name.to_string(),
      total: packages.len(),
      installed: installed_count,
      updates_available: 0, // TODO: 检查可用更新
    })
  }

  /// 获取所有包管理器的状态（并行执行）
  pub async fn get_all_status() -> Result<Vec<PackageManager>, String> {
    log::info!("Getting status for all package managers (parallel)");
    let start = std::time::Instant::now();

    // 创建异步任务
    let tasks: Vec<_> = SUPPORTED_MANAGERS
      .iter()
      .map(|(manager_name, _)| {
        let manager = manager_name.to_string();
        async move {
          Self::get_status_async(&manager).await
        }
      })
      .collect();

    // 并行执行所有任务
    let results = futures::future::join_all(tasks).await;

    // 收集结果
    let managers: Vec<PackageManager> = results.into_iter().flatten().collect();

    let elapsed = start.elapsed();
    log::info!(
      "Successfully retrieved status for {} managers in {:?} (parallel execution)",
      managers.len(),
      elapsed
    );

    Ok(managers)
  }
}
