use std::fs;
use std::path::Path;

/// 清理超过指定天数的旧日志文件
pub fn cleanup_old_logs(log_dir: &Path, days_to_keep: u32) {
  log::debug!(
    "Starting log cleanup in {:?}, keeping {} days",
    log_dir,
    days_to_keep
  );

  if !log_dir.exists() {
    log::debug!("Log directory does not exist, skipping cleanup");
    return;
  }

  let now = chrono::Local::now().date_naive();
  let mut cleaned_count = 0;
  let mut error_count = 0;

  match fs::read_dir(log_dir) {
    Ok(entries) => {
      for entry in entries.flatten() {
        let path = entry.path();

        // 只处理日志文件 (rainbox-*.log)
        if let Some(filename) = path.file_name().and_then(|n| n.to_str()) {
          if !filename.starts_with("rainbox-") || !filename.ends_with(".log") {
            continue;
          }

          // 从文件名提取日期: rainbox-2025-11-06.log
          if let Some(date_str) = filename
            .strip_prefix("rainbox-")
            .and_then(|s| s.strip_suffix(".log"))
          {
            match chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
              Ok(file_date) => {
                let age = now.signed_duration_since(file_date).num_days();

                if age > days_to_keep as i64 {
                  log::info!("Deleting old log file: {:?} (age: {} days)", path, age);
                  match fs::remove_file(&path) {
                    Ok(_) => {
                      cleaned_count += 1;
                      log::debug!("Successfully deleted: {:?}", path);
                    }
                    Err(e) => {
                      error_count += 1;
                      log::error!("Failed to delete {:?}: {}", path, e);
                    }
                  }
                }
              }
              Err(e) => {
                log::warn!("Failed to parse date from filename {}: {}", filename, e);
              }
            }
          }
        }
      }

      log::info!(
        "Log cleanup completed: {} files deleted, {} errors",
        cleaned_count,
        error_count
      );
    }
    Err(e) => {
      log::error!("Failed to read log directory {:?}: {}", log_dir, e);
    }
  }
}
