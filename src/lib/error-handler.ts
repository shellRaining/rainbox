interface ErrorInfo {
  title: string;
  message: string;
  suggestion?: string;
  canRetry?: boolean;
}

/**
 * 将技术错误转换为用户友好的错误信息
 */
export function parseError(error: unknown): ErrorInfo {
  const errorStr = String(error).toLowerCase();

  // 网络相关错误
  if (errorStr.includes('network') || errorStr.includes('connection')) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to package manager',
      suggestion: 'Please check your internet connection and try again',
      canRetry: true,
    };
  }

  // 权限错误
  if (
    errorStr.includes('permission') ||
    errorStr.includes('eacces') ||
    errorStr.includes('access denied')
  ) {
    return {
      title: 'Permission Denied',
      message: 'Insufficient permissions to install packages',
      suggestion: 'Try running the application with administrator privileges or use sudo',
      canRetry: true,
    };
  }

  // 包未找到
  if (
    errorStr.includes('not found') ||
    errorStr.includes('404') ||
    errorStr.includes('no such package')
  ) {
    return {
      title: 'Package Not Found',
      message: 'The requested package does not exist',
      suggestion: 'Check the package name and try again',
      canRetry: false,
    };
  }

  // 磁盘空间不足
  if (
    errorStr.includes('no space') ||
    errorStr.includes('disk full') ||
    errorStr.includes('enospc')
  ) {
    return {
      title: 'Insufficient Disk Space',
      message: 'Not enough disk space to install packages',
      suggestion: 'Free up some disk space and try again',
      canRetry: true,
    };
  }

  // 包管理器未安装
  if (errorStr.includes('command not found') || errorStr.includes('not installed')) {
    return {
      title: 'Package Manager Not Found',
      message: 'The required package manager is not installed',
      suggestion: 'Please install the package manager first',
      canRetry: false,
    };
  }

  // 依赖冲突
  if (errorStr.includes('conflict') || errorStr.includes('dependency')) {
    return {
      title: 'Dependency Conflict',
      message: 'Package dependencies could not be resolved',
      suggestion: 'Try updating your package manager or resolving conflicts manually',
      canRetry: true,
    };
  }

  // 超时错误
  if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
    return {
      title: 'Operation Timed Out',
      message: 'The operation took too long to complete',
      suggestion: 'The server might be slow. Please try again later',
      canRetry: true,
    };
  }

  // 默认错误
  return {
    title: 'Installation Failed',
    message: String(error),
    suggestion: 'Please check the logs for more details',
    canRetry: true,
  };
}

/**
 * 格式化错误消息用于显示
 */
export function formatErrorMessage(error: unknown): string {
  const info = parseError(error);
  let message = info.message;

  if (info.suggestion) {
    message += `\n\n💡 ${info.suggestion}`;
  }

  return message;
}
