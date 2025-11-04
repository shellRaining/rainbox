/// 检查是否是命令缺失错误
pub fn is_command_missing_error(error: &str) -> bool {
  error.contains("No such file or directory") || error.contains("command not found")
}
