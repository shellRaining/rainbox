export interface PackageManager {
  name: string;
  total: number;
  installed: number;
  updates_available: number;
}

export interface Package {
  name: string;
  manager: string;
  installed: boolean;
  version: string | null;
  is_local: boolean;
}

export interface DiffResult {
  name: string;
  display_name: string;
  to_install: string[];
  to_remove: string[];
}
