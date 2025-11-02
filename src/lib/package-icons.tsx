import { Package } from 'lucide-react';

export const getPackageManagerIcon = (name: string) => {
  const iconClass = 'h-4 w-4';

  switch (name.toLowerCase()) {
    case 'npm':
      return <img src="/icons/npm.svg" className={iconClass} alt="npm" />;
    case 'pnpm':
      return <img src="/icons/pnpm.svg" className={iconClass} alt="pnpm" />;
    case 'yarn':
      return <img src="/icons/yarn.svg" className={iconClass} alt="yarn" />;
    case 'bun':
      return <img src="/icons/bun.svg" className={iconClass} alt="bun" />;
    case 'brew':
    case 'brew-cask':
      return <img src="/icons/brew.svg" className={iconClass} alt="homebrew" />;
    case 'cargo':
      return <img src="/icons/cargo.svg" className={iconClass} alt="cargo" />;
    case 'pip':
    case 'pipx':
    case 'uv':
      return <img src="/icons/python.svg" className={iconClass} alt="python" />;
    case 'go':
      return <img src="/icons/go.svg" className={iconClass} alt="go" />;
    case 'luarocks':
      return <img src="/icons/lua.svg" className={iconClass} alt="lua" />;
    default:
      return <Package className={iconClass} />;
  }
};

export const getPackageManagerColor = (name: string): string => {
  switch (name.toLowerCase()) {
    case 'npm':
      return 'text-red-600 dark:text-red-500'; // npm red
    case 'pnpm':
      return 'text-yellow-600 dark:text-yellow-500'; // pnpm yellow/orange
    case 'yarn':
      return 'text-blue-600 dark:text-blue-500'; // yarn blue
    case 'bun':
      return 'text-pink-600 dark:text-pink-500'; // bun peach/pink
    case 'brew':
    case 'brew-cask':
      return 'text-amber-600 dark:text-amber-500'; // homebrew amber
    case 'cargo':
      return 'text-orange-700 dark:text-orange-600'; // rust orange
    case 'pip':
    case 'pipx':
      return 'text-blue-500 dark:text-blue-400'; // python blue
    case 'uv':
      return 'text-purple-600 dark:text-purple-500'; // uv purple
    case 'go':
      return 'text-cyan-600 dark:text-cyan-500'; // go cyan
    case 'luarocks':
      return 'text-purple-600 dark:text-purple-500'; // lua purple
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};
