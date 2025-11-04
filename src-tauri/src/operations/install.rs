use crate::utils::get_dotfiles_root;
use tauri::Emitter;

pub struct PackageOperation;

#[derive(Debug, Clone, Copy)]
pub enum OperationType {
  Install,
  Update,
}

impl OperationType {
  fn as_str(&self) -> &'static str {
    match self {
      Self::Install => "install",
      Self::Update => "update",
    }
  }

  fn progress_event(&self) -> &'static str {
    match self {
      Self::Install => "install-progress",
      Self::Update => "update-progress",
    }
  }

  fn error_event(&self) -> &'static str {
    match self {
      Self::Install => "install-error",
      Self::Update => "update-error",
    }
  }

  fn complete_event(&self) -> &'static str {
    match self {
      Self::Install => "install-complete",
      Self::Update => "update-complete",
    }
  }

  fn complete_message(&self) -> &'static str {
    match self {
      Self::Install => "Installation finished",
      Self::Update => "Update finished",
    }
  }

  fn start_message(&self) -> String {
    match self {
      Self::Install => "Installation started".to_string(),
      Self::Update => "Update started".to_string(),
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

    let dotfiles_root = get_dotfiles_root();
    let script_path = dotfiles_root.join("scripts").join("package-sync.sh");

    if !script_path.exists() {
      return Err(format!("Script not found: {:?}", script_path));
    }

    let mut args = vec![operation.as_str().to_string()];
    if let Some(mgr) = manager {
      args.push(mgr);
    }

    let (mut rx, _child) = app
      .shell()
      .command("zsh")
      .args(&[script_path.to_string_lossy().to_string()])
      .args(&args)
      .spawn()
      .map_err(|e| format!("Failed to spawn command: {}", e))?;

    // 实时推送输出到前端
    let progress_event = operation.progress_event();
    let error_event = operation.error_event();
    let complete_event = operation.complete_event();
    let complete_message = operation.complete_message();

    tauri::async_runtime::spawn(async move {
      while let Some(event) = rx.recv().await {
        match event {
          CommandEvent::Stdout(line) => {
            let _ = window.emit(progress_event, line);
          }
          CommandEvent::Stderr(line) => {
            let _ = window.emit(error_event, line);
          }
          CommandEvent::Terminated(_) => {
            let _ = window.emit(complete_event, complete_message);
          }
          _ => {}
        }
      }
    });

    Ok(operation.start_message())
  }
}
