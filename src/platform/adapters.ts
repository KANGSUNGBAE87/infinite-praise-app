export type AdapterStatus = "stub" | "enabled";
export type AuthProviderId = "apps_in_toss" | "google_play";
export type PaymentStoreId = "apps_in_toss_iap" | "google_play_billing";
export type AdNetworkId = "apps_in_toss_ads" | "admob";
export type NotificationCapability = "unsupported" | "preview_only" | "permission_required" | "ready";

export interface AuthAdapter {
  status: AdapterStatus;
  plannedProviders: AuthProviderId[];
  getCurrentUser(): Promise<{ status: "anonymous" }>;
}
export type EntitlementId = "premium_monthly" | "remove_ads" | "advanced_receipts";
export interface PaymentAdapter {
  status: AdapterStatus;
  plannedStores: PaymentStoreId[];
  hasEntitlement(entitlementId: EntitlementId): Promise<boolean>;
}
export type AdPlacementId = "praise_result" | "receipt_screen";
export interface AdsAdapter {
  status: AdapterStatus;
  plannedNetworks: AdNetworkId[];
  showPlacement(placementId: AdPlacementId): Promise<{ shown: boolean; reason?: "ads_disabled_in_mvp" | "placement_unavailable" }>;
}
export interface NotificationAdapter {
  status: AdapterStatus;
  capability: NotificationCapability;
  getPermissionStatus(): Promise<"unsupported" | "granted" | "denied" | "prompt">;
  requestPermission(): Promise<"unsupported" | "granted" | "denied" | "prompt">;
  scheduleReminder(reminder: { id: string }): Promise<{ status: "preview_only" | "scheduled" | "blocked"; reason?: "notifications_stubbed_in_mvp" | "permission_denied" | "unsupported" }>;
  cancelReminder(reminderId: string): Promise<{ canceled: boolean; reason?: string }>;
}

export interface StorageAdapter {
  status: AdapterStatus;
  loadLocale(): string | null;
  saveLocale(locale: string): void;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clearAll(): void;
}
export interface AnalyticsAdapter {
  status: AdapterStatus;
  track(eventName: string, properties?: Record<string, unknown>): Promise<{ tracked: boolean; reason?: "analytics_disabled_in_mvp" }>;
}
export interface PlatformAdapters {
  auth: AuthAdapter;
  payment: PaymentAdapter;
  ads: AdsAdapter;
  storage: StorageAdapter;
  analytics: AnalyticsAdapter;
  notifications: NotificationAdapter;
}

const localeStorageKey = "praise-me:locale-v1";
const appStoragePrefix = "praise-me:";
const createMemoryStorage = () => { const items = new Map<string, string>(); return { getItem:(k:string)=>items.get(k)??null,setItem:(k:string,v:string)=>items.set(k,v),removeItem:(k:string)=>items.delete(k),clear:()=>items.clear() }; };
const getDefaultStorage = () => (typeof window !== "undefined" && window.localStorage ? window.localStorage : createMemoryStorage());

export function createMvpPlatformAdapters(storageBackend = getDefaultStorage()): PlatformAdapters {
  return {
    auth: { status:"stub", plannedProviders:["apps_in_toss","google_play"], async getCurrentUser(){ return { status: "anonymous" }; } },
    payment: { status:"stub", plannedStores:["apps_in_toss_iap","google_play_billing"], async hasEntitlement(){ return false; } },
    ads: { status:"stub", plannedNetworks:["apps_in_toss_ads","admob"], async showPlacement(){ return { shown:false, reason:"ads_disabled_in_mvp" }; } },
    storage: { status:"stub", loadLocale(){ return storageBackend.getItem(localeStorageKey); }, saveLocale(locale){ storageBackend.setItem(localeStorageKey, locale); }, getItem(key){ return storageBackend.getItem(`${appStoragePrefix}${key}`); }, setItem(key, value){ storageBackend.setItem(`${appStoragePrefix}${key}`, value); }, removeItem(key){ storageBackend.removeItem(`${appStoragePrefix}${key}`); }, clearAll(){ storageBackend.removeItem(localeStorageKey); if (typeof storageBackend.clear === "function") storageBackend.clear(); } },
    analytics: { status:"stub", async track(){ return { tracked:false, reason:"analytics_disabled_in_mvp" }; } },
    notifications: { status:"stub", capability:"preview_only", async getPermissionStatus(){ return "unsupported"; }, async requestPermission(){ return "unsupported"; }, async scheduleReminder(){ return { status:"preview_only", reason:"notifications_stubbed_in_mvp" }; }, async cancelReminder(){ return { canceled:false, reason:"notifications_stubbed_in_mvp" }; } },
  };
}
