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
  scheduleReminder(reminder: { id: string; title?: string; body?: string; scheduledAt?: number }): Promise<{ status: "preview_only" | "scheduled" | "blocked"; reason?: "notifications_stubbed_in_mvp" | "permission_denied" | "unsupported" }>;
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
const notificationTimers = new Map<string, ReturnType<typeof setTimeout>>();

function getNotificationApi(): typeof Notification | null {
  return typeof globalThis !== "undefined" && "Notification" in globalThis
    ? globalThis.Notification
    : null;
}

function mapPermission(permission: NotificationPermission): "granted" | "denied" | "prompt" {
  if (permission === "granted" || permission === "denied") return permission;
  return "prompt";
}

export function createMvpPlatformAdapters(storageBackend = getDefaultStorage()): PlatformAdapters {
  return {
    auth: { status:"stub", plannedProviders:["apps_in_toss","google_play"], async getCurrentUser(){ return { status: "anonymous" }; } },
    payment: { status:"stub", plannedStores:["apps_in_toss_iap","google_play_billing"], async hasEntitlement(){ return false; } },
    ads: { status:"stub", plannedNetworks:["apps_in_toss_ads","admob"], async showPlacement(){ return { shown:false, reason:"ads_disabled_in_mvp" }; } },
    storage: { status:"stub", loadLocale(){ return storageBackend.getItem(localeStorageKey); }, saveLocale(locale){ storageBackend.setItem(localeStorageKey, locale); }, getItem(key){ return storageBackend.getItem(`${appStoragePrefix}${key}`); }, setItem(key, value){ storageBackend.setItem(`${appStoragePrefix}${key}`, value); }, removeItem(key){ storageBackend.removeItem(`${appStoragePrefix}${key}`); }, clearAll(){ storageBackend.removeItem(localeStorageKey); if (typeof storageBackend.clear === "function") storageBackend.clear(); } },
    analytics: { status:"stub", async track(){ return { tracked:false, reason:"analytics_disabled_in_mvp" }; } },
    notifications: {
      status:"enabled",
      capability:"permission_required",
      async getPermissionStatus(){
        const notificationApi = getNotificationApi();
        return notificationApi ? mapPermission(notificationApi.permission) : "unsupported";
      },
      async requestPermission(){
        const notificationApi = getNotificationApi();
        if (!notificationApi) return "unsupported";
        if (notificationApi.permission === "granted" || notificationApi.permission === "denied") {
          return mapPermission(notificationApi.permission);
        }
        return mapPermission(await notificationApi.requestPermission());
      },
      async scheduleReminder(reminder){
        const notificationApi = getNotificationApi();
        if (!notificationApi) return { status:"blocked", reason:"unsupported" };
        if (notificationApi.permission !== "granted") return { status:"blocked", reason:"permission_denied" };
        const delayMs = Math.max(0, (reminder.scheduledAt ?? Date.now()) - Date.now());
        const previousTimer = notificationTimers.get(reminder.id);
        if (previousTimer) clearTimeout(previousTimer);
        const timer = setTimeout(() => {
          new notificationApi(reminder.title ?? "내편한마디", { body: reminder.body ?? "" });
          notificationTimers.delete(reminder.id);
        }, delayMs);
        notificationTimers.set(reminder.id, timer);
        return { status:"scheduled" };
      },
      async cancelReminder(reminderId){
        const timer = notificationTimers.get(reminderId);
        if (!timer) return { canceled:false, reason:"not_found" };
        clearTimeout(timer);
        notificationTimers.delete(reminderId);
        return { canceled:true };
      }
    },
  };
}
