export interface AppConfig {
  command_paths: Record<string, string>;
}

export interface CommandPathStatus {
  command: string;
  displayName: string;
  configured: boolean;
  path: string | null;
  detected: string | null;
  exists: boolean;
}

export const PACKAGE_MANAGERS = [
  { command: 'brew', displayName: 'Homebrew' },
  { command: 'npm', displayName: 'npm' },
  { command: 'pnpm', displayName: 'pnpm' },
  { command: 'yarn', displayName: 'Yarn' },
  { command: 'bun', displayName: 'Bun' },
  { command: 'cargo', displayName: 'Cargo' },
  { command: 'pip', displayName: 'pip' },
  { command: 'pipx', displayName: 'pipx' },
  { command: 'go', displayName: 'Go' },
  { command: 'luarocks', displayName: 'LuaRocks' },
  { command: 'uv', displayName: 'uv' },
] as const;
