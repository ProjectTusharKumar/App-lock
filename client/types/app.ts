export interface AppInfo {
  id: string;
  name: string;
  packageName: string;
  icon: string;
  isLocked: boolean;
  category: string;
}

export interface IntruderLog {
  id: string;
  timestamp: number;
  failedAttempts: number;
  photoUri?: string;
  appName?: string;
}

export interface AuthConfig {
  authType: "pin" | "pattern" | "biometric";
  pinHash?: string;
  biometricEnabled: boolean;
  isSetupComplete: boolean;
}

export interface SecuritySettings {
  screenshotPrevention: boolean;
  rootDetection: boolean;
  uninstallProtection: boolean;
  intruderDetection: boolean;
  lockTimeout: number;
  recoveryEmail?: string;
}
