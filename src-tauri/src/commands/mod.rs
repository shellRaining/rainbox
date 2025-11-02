// Export all command modules
pub mod config;
pub mod packages;

// Re-export all commands for easy registration
pub use config::*;
pub use packages::*;
