import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppInfo, IntruderLog, AuthConfig, SecuritySettings } from "@/types/app";

const KEYS = {
  LOCKED_APPS: "@app_lock:locked_apps",
  INTRUDER_LOGS: "@app_lock:intruder_logs",
  AUTH_CONFIG: "@app_lock:auth_config",
  SECURITY_SETTINGS: "@app_lock:security_settings",
  IS_ALL_LOCKED: "@app_lock:is_all_locked",
};

const MOCK_APPS: AppInfo[] = [
  { id: "1", name: "Photos", packageName: "com.apple.photos", icon: "image", isLocked: false, category: "Media" },
  { id: "2", name: "Messages", packageName: "com.apple.messages", icon: "message-circle", isLocked: false, category: "Social" },
  { id: "3", name: "Mail", packageName: "com.apple.mail", icon: "mail", isLocked: false, category: "Productivity" },
  { id: "4", name: "Notes", packageName: "com.apple.notes", icon: "file-text", isLocked: false, category: "Productivity" },
  { id: "5", name: "Banking", packageName: "com.bank.app", icon: "dollar-sign", isLocked: false, category: "Finance" },
  { id: "6", name: "Instagram", packageName: "com.instagram.android", icon: "camera", isLocked: false, category: "Social" },
  { id: "7", name: "WhatsApp", packageName: "com.whatsapp", icon: "phone", isLocked: false, category: "Social" },
  { id: "8", name: "Twitter", packageName: "com.twitter.android", icon: "twitter", isLocked: false, category: "Social" },
  { id: "9", name: "Gallery", packageName: "com.gallery", icon: "grid", isLocked: false, category: "Media" },
  { id: "10", name: "Calendar", packageName: "com.apple.calendar", icon: "calendar", isLocked: false, category: "Productivity" },
  { id: "11", name: "Files", packageName: "com.apple.files", icon: "folder", isLocked: false, category: "Productivity" },
  { id: "12", name: "Settings", packageName: "com.apple.settings", icon: "settings", isLocked: false, category: "System" },
];

export async function getLockedApps(): Promise<AppInfo[]> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.LOCKED_APPS);
    if (stored) {
      return JSON.parse(stored);
    }
    await AsyncStorage.setItem(KEYS.LOCKED_APPS, JSON.stringify(MOCK_APPS));
    return MOCK_APPS;
  } catch {
    return MOCK_APPS;
  }
}

export async function updateAppLockStatus(appId: string, isLocked: boolean): Promise<AppInfo[]> {
  const apps = await getLockedApps();
  const updated = apps.map((app) =>
    app.id === appId ? { ...app, isLocked } : app
  );
  await AsyncStorage.setItem(KEYS.LOCKED_APPS, JSON.stringify(updated));
  return updated;
}

export async function lockAllApps(lock: boolean): Promise<AppInfo[]> {
  const apps = await getLockedApps();
  const updated = apps.map((app) => ({ ...app, isLocked: lock }));
  await AsyncStorage.setItem(KEYS.LOCKED_APPS, JSON.stringify(updated));
  return updated;
}

export async function getIsAllLocked(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.IS_ALL_LOCKED);
    return stored === "true";
  } catch {
    return false;
  }
}

export async function setIsAllLocked(locked: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.IS_ALL_LOCKED, locked ? "true" : "false");
}

export async function getIntruderLogs(): Promise<IntruderLog[]> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.INTRUDER_LOGS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function addIntruderLog(log: Omit<IntruderLog, "id">): Promise<void> {
  const logs = await getIntruderLogs();
  const newLog: IntruderLog = {
    ...log,
    id: Date.now().toString(),
  };
  logs.unshift(newLog);
  await AsyncStorage.setItem(KEYS.INTRUDER_LOGS, JSON.stringify(logs.slice(0, 50)));
}

export async function clearIntruderLogs(): Promise<void> {
  await AsyncStorage.setItem(KEYS.INTRUDER_LOGS, JSON.stringify([]));
}

export async function getAuthConfig(): Promise<AuthConfig | null> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.AUTH_CONFIG);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export async function saveAuthConfig(config: AuthConfig): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_CONFIG, JSON.stringify(config));
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const defaults: SecuritySettings = {
    screenshotPrevention: true,
    rootDetection: true,
    uninstallProtection: false,
    intruderDetection: true,
    lockTimeout: 0,
    recoveryEmail: undefined,
  };
  try {
    const stored = await AsyncStorage.getItem(KEYS.SECURITY_SETTINGS);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

export async function saveSecuritySettings(settings: SecuritySettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SECURITY_SETTINGS, JSON.stringify(settings));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const config = await getAuthConfig();
  if (!config || !config.pinHash) return false;
  return config.pinHash === pin;
}

export async function setupPin(pin: string): Promise<void> {
  const config: AuthConfig = {
    authType: "pin",
    pinHash: pin,
    biometricEnabled: false,
    isSetupComplete: true,
  };
  await saveAuthConfig(config);
}
