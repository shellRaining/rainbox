use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

/// 缓存条目，包含数据和时间戳
#[derive(Clone)]
struct CacheEntry<T> {
    data: T,
    timestamp: Instant,
}

impl<T> CacheEntry<T> {
    fn new(data: T) -> Self {
        Self {
            data,
            timestamp: Instant::now(),
        }
    }

    fn is_expired(&self, ttl: Duration) -> bool {
        self.timestamp.elapsed() > ttl
    }
}

/// 包管理器缓存
pub struct PackageCache<T> {
    cache: Arc<RwLock<HashMap<String, CacheEntry<T>>>>,
    ttl: Duration,
}

impl<T: Clone> PackageCache<T> {
    /// 创建新的缓存实例
    pub fn new(ttl_secs: u64) -> Self {
        Self {
            cache: Arc::new(RwLock::new(HashMap::new())),
            ttl: Duration::from_secs(ttl_secs),
        }
    }

    /// 获取缓存的值，如果过期则返回 None
    pub fn get(&self, key: &str) -> Option<T> {
        let cache = self.cache.read().unwrap();
        
        if let Some(entry) = cache.get(key) {
            if !entry.is_expired(self.ttl) {
                log::debug!("Cache hit for key: {}", key);
                return Some(entry.data.clone());
            } else {
                log::debug!("Cache expired for key: {}", key);
            }
        }
        
        log::debug!("Cache miss for key: {}", key);
        None
    }

    /// 设置缓存值
    pub fn set(&self, key: String, value: T) {
        let mut cache = self.cache.write().unwrap();
        cache.insert(key.clone(), CacheEntry::new(value));
        log::debug!("Cache set for key: {}", key);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;

    #[test]
    fn test_cache_basic() {
        let cache = PackageCache::new(1);
        
        // 测试设置和获取
        cache.set("test".to_string(), vec!["pkg1".to_string()]);
        assert!(cache.get("test").is_some());
        
        // 测试过期
        sleep(Duration::from_secs(2));
        assert!(cache.get("test").is_none());
    }
}
