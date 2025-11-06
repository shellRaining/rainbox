use crate::utils::PathHelper;
use tauri::Emitter;

pub struct PackageOperation;

#[derive(Debug, Clone, Copy)]
pub enum OperationType {
  Install,
}

impl OperationType {
  fn as_str(&self) -> &'static str {
    match self {
      Self::Install => "install",
    }
  }

  fn progress_event(&self) -> &'static str {
    match self {
      Self::Install => "install-progress",
    }
  }

  fn error_event(&self) -> &'static str {
    match self {
      Self::Install => "install-error",
    }
  }

  fn complete_event(&self) -> &'static str {
    match self {
      Self::Install => "install-complete",
    }
  }

  fn complete_message(&self) -> &'static str {
    match self {
      Self::Install => "Installation finished",
    }
  }

  fn start_message(&self) -> String {
    match self {
      Self::Install => "Installation started".to_string(),
    }
  }
}

impl PackageOperation {
  /// 执行包操作（安装或更新）
  pub async fn execute(
    app: tauri::AppHandle,
    window: tauri::Window,
    operation: OperationType,
    manager: Option<String>,
  ) -> Result<String, String> {
    use tauri_plugin_shell::process::CommandEvent;
    use tauri_plugin_shell::ShellExt;

    let start_time = std::time::Instant::now();
    log::info!(
      "Starting {} operation for manager: {:?}",
      operation.as_str(),
      manager
    );

    let script_path = PathHelper::package_sync_script();

    if !script_path.exists() {
      log::error!("Script not found: {:?}", script_path);
      return Err(format!("Script not found: {:?}", script_path));
    }

    log::debug!("Using script: {:?}", script_path);

    let mut args = vec![operation.as_str().to_string()];
    if let Some(ref mgr) = manager {
      args.push(mgr.clone());
    }

    log::debug!("Command arguments: {:?}", args);

    let (mut rx, _child) = app
      .shell()
      .command("zsh")
      .args(&[script_path.to_string_lossy().to_string()])
      .args(&args)
      .spawn()
      .map_err(|e| {
        log::error!("Failed to spawn command: {}", e);
        format!("Failed to spawn command: {}", e)
      })?;

    log::info!("Command spawned successfully");

    // 实时推送输出到前端
    let progress_event = operation.progress_event();
    let error_event = operation.error_event();
    let complete_event = operation.complete_event();
    let complete_message = operation.complete_message();
    let manager_clone = manager.clone();

    tauri::async_runtime::spawn(async move {
      let mut stdout_lines = 0;
      let mut stderr_lines = 0;

      while let Some(event) = rx.recv().await {
        match event {
          CommandEvent::Stdout(line) => {
            stdout_lines += 1;
            let line_str = String::from_utf8_lossy(&line);
            log::trace!("stdout: {}", line_str);
            let _ = window.emit(progress_event, line);
          }
          CommandEvent::Stderr(line) => {
            stderr_lines += 1;
            let line_str = String::from_utf8_lossy(&line);
            log::warn!("stderr: {}", line_str);
            let _ = window.emit(error_event, line);
          }
          CommandEvent::Terminated(payload) => {
            let elapsed = start_time.elapsed();
            log::info!(
              "{} operation completed in {:?} for {:?}, exit code: {:?}, stdout lines: {}, stderr lines: {}",
              operation.as_str(),
              elapsed,
              manager_clone,
              payload.code,
              stdout_lines,
              stderr_lines
            );
            let _ = window.emit(complete_event, complete_message);
          }
          CommandEvent::Error(err) => {
            log::error!("Command error: {}", err);
          }
          _ => {}
        }
      }
    });

    Ok(operation.start_message())
  }
}
