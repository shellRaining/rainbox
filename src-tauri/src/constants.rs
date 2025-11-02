use serde::{Deserialize, Serialize};

/// 包管理器枚举 - 编译时类型安全
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PackageManagerType {
  Brew,
  BrewCask,
  Npm,
  Pnpm,
  Yarn,
  Bun,
  Cargo,
  Pip,
  Pipx,
  Luarocks,
  Go,
  Uv,
}

impl PackageManagerType {
  /// 获取包管理器 ID
  #[allow(dead_code)]
  pub fn id(&self) -> &'static str {
    match self {
      Self::Brew => "brew",
      Self::BrewCask => "brew-cask",
      Self::Npm => "npm",
      Self::Pnpm => "pnpm",
      Self::Yarn => "yarn",
      Self::Bun => "bun",
      Self::Cargo => "cargo",
      Self::Pip => "pip",
      Self::Pipx => "pipx",
      Self::Luarocks => "luarocks",
      Self::Go => "go",
      Self::Uv => "uv",
    }
  }

  /// 获取显示名称
  #[allow(dead_code)]
  pub fn display_name(&self) -> &'static str {
    match self {
      Self::Brew => "Homebrew",
      Self::BrewCask => "Homebrew Cask",
      Self::Npm => "npm",
      Self::Pnpm => "pnpm",
      Self::Yarn => "Yarn",
      Self::Bun => "Bun",
      Self::Cargo => "Cargo",
      Self::Pip => "Pip",
      Self::Pipx => "Pipx",
      Self::Luarocks => "LuaRocks",
      Self::Go => "Go",
      Self::Uv => "uv",
    }
  }

  /// 从字符串解析
  pub fn from_str(s: &str) -> Option<Self> {
    match s {
      "brew" => Some(Self::Brew),
      "brew-cask" => Some(Self::BrewCask),
      "npm" => Some(Self::Npm),
      "pnpm" => Some(Self::Pnpm),
      "yarn" => Some(Self::Yarn),
      "bun" => Some(Self::Bun),
      "cargo" => Some(Self::Cargo),
      "pip" => Some(Self::Pip),
      "pipx" => Some(Self::Pipx),
      "luarocks" => Some(Self::Luarocks),
      "go" => Some(Self::Go),
      "uv" => Some(Self::Uv),
      _ => None,
    }
  }

  /// 获取所有支持的包管理器
  #[allow(dead_code)]
  pub fn all() -> &'static [Self] {
    &[
      Self::Brew,
      Self::BrewCask,
      Self::Npm,
      Self::Pnpm,
      Self::Yarn,
      Self::Bun,
      Self::Cargo,
      Self::Pip,
      Self::Pipx,
      Self::Luarocks,
      Self::Go,
      Self::Uv,
    ]
  }
}

/// 支持的包管理器列表 (ID, 显示名称) - 向后兼容
pub const SUPPORTED_MANAGERS: &[(&str, &str)] = &[
  ("brew", "Homebrew"),
  ("brew-cask", "Homebrew Cask"),
  ("npm", "npm"),
  ("pnpm", "pnpm"),
  ("yarn", "Yarn"),
  ("bun", "Bun"),
  ("cargo", "Cargo"),
  ("pip", "Pip"),
  ("pipx", "Pipx"),
  ("luarocks", "LuaRocks"),
  ("go", "Go"),
  ("uv", "uv"),
];
