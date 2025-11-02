mod config;

use serde::{Deserialize, Serialize};

pub use config::AppConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Package {
  pub name: String,
  pub manager: String,
  pub installed: bool,
  pub version: Option<String>,
  pub is_local: bool, // 是否来自 .local.txt
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageManager {
  pub name: String,
  pub total: usize,
  pub installed: usize,
  pub updates_available: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffResult {
  pub name: String,
  pub display_name: String,
  pub to_install: Vec<String>,
  pub to_remove: Vec<String>,
}
