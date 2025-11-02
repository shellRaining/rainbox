use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};

/// 获取 dotfiles 根目录
pub fn get_dotfiles_root() -> PathBuf {
  // 优先使用环境变量
  if let Ok(dotfiles_path) = std::env::var("DOTFILES_ROOT") {
    return PathBuf::from(dotfiles_path);
  }

  // 尝试使用 HOME 目录下的 dotfiles
  if let Ok(home) = std::env::var("HOME") {
    let dotfiles = PathBuf::from(home).join("Documents/dotfiles");
    if dotfiles.exists() {
      return dotfiles;
    }
  }

  // 开发模式：从 src-tauri 目录向上两层
  // gui/src-tauri -> gui -> dotfiles
  PathBuf::from(env!("CARGO_MANIFEST_DIR"))
    .parent()
    .and_then(|p| p.parent())
    .expect("Cannot find dotfiles root")
    .to_path_buf()
}

/// 解析单个文件内容，提取有效的包名
fn parse_package_lines(content: &str) -> HashSet<String> {
  content
    .lines()
    .map(|line| line.trim())
    .filter(|line| !line.is_empty() && !line.starts_with('#'))
    .map(|line| line.to_string())
    .collect()
}

/// 读取文件并解析包列表，文件不存在返回空集合
fn read_packages_from_file(file_path: &Path) -> Result<HashSet<String>, String> {
  if !file_path.exists() {
    return Ok(HashSet::new());
  }

  let content =
    fs::read_to_string(file_path).map_err(|e| format!("Failed to read {:?}: {}", file_path, e))?;

  Ok(parse_package_lines(&content))
}

/// 读取包列表文件，自动合并 .local.txt
pub fn read_package_list(base_file: &Path) -> Result<Vec<String>, String> {
  let base_packages = read_packages_from_file(base_file)?;
  let local_packages = read_packages_from_file(&base_file.with_extension("local.txt"))?;

  let all_packages: HashSet<String> = base_packages.union(&local_packages).cloned().collect();

  let mut result: Vec<String> = all_packages.into_iter().collect();
  result.sort();
  Ok(result)
}

/// 读取包列表文件并返回带来源信息的结果
/// 返回: Vec<(包名, 是否来自local文件)>
pub fn read_package_list_with_source(base_file: &Path) -> Result<Vec<(String, bool)>, String> {
  let base_packages = read_packages_from_file(base_file)?;
  let local_packages = read_packages_from_file(&base_file.with_extension("local.txt"))?;

  let all_packages: HashSet<_> = base_packages.union(&local_packages).collect();

  let mut result: Vec<(String, bool)> = all_packages
    .into_iter()
    .map(|package| {
      let is_local = local_packages.contains(package);
      (package.clone(), is_local)
    })
    .collect();

  result.sort_by(|a, b| a.0.cmp(&b.0));
  Ok(result)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_get_dotfiles_root() {
    let root = get_dotfiles_root();
    assert!(root.ends_with("dotfiles"));
  }
}
