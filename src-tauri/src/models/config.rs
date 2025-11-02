use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// 用户配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
  /// 包管理器命令路径配置
  pub command_paths: HashMap<String, String>,
}

impl Default for AppConfig {
  fn default() -> Self {
    Self {
      command_paths: HashMap::new(),
    }
  }
}

impl AppConfig {
  /// 加载配置文件
  pub fn load() -> Result<Self, String> {
    let config_path = Self::get_config_path()?;

    if !config_path.exists() {
      return Ok(Self::default());
    }

    let content =
      std::fs::read_to_string(&config_path).map_err(|e| format!("Failed to read config: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))
  }

  /// 保存配置文件
  pub fn save(&self) -> Result<(), String> {
    let config_path = Self::get_config_path()?;

    // 确保配置目录存在
    if let Some(parent) = config_path.parent() {
      std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create config dir: {}", e))?;
    }

    let content = serde_json::to_string_pretty(self)
      .map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(&config_path, content).map_err(|e| format!("Failed to write config: {}", e))
  }

  /// 获取配置文件路径
  fn get_config_path() -> Result<PathBuf, String> {
    let home =
      std::env::var("HOME").map_err(|_| "HOME environment variable not set".to_string())?;

    Ok(
      PathBuf::from(home)
        .join(".config")
        .join("rainbox")
        .join("config.json"),
    )
  }

  /// 获取命令路径，如果没有配置则返回None
  pub fn get_command_path(&self, command: &str) -> Option<PathBuf> {
    self.command_paths.get(command).map(|s| PathBuf::from(s))
  }

  /// 设置命令路径
  pub fn set_command_path(&mut self, command: String, path: String) {
    self.command_paths.insert(command, path);
  }
}
