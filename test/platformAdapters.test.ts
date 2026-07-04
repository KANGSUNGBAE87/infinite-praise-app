import { afterEach, describe, expect, it, vi } from "vitest";
import { createMvpPlatformAdapters } from "../src/platform/adapters";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("MVP platform adapters", () => {
  it("keeps the platform seams enabled only as stubs", async () => {
    const adapters = createMvpPlatformAdapters();

    expect(adapters.auth.status).toBe("stub");
    expect(adapters.payment.status).toBe("stub");
    expect(adapters.ads.status).toBe("stub");
    expect(adapters.storage.status).toBe("stub");
    expect(adapters.analytics.status).toBe("stub");
    expect(adapters.notifications.status).toBe("enabled");

    await expect(adapters.auth.getCurrentUser()).resolves.toEqual({ status: "anonymous" });
    await expect(adapters.payment.hasEntitlement("premium_monthly")).resolves.toBe(false);
    await expect(adapters.ads.showPlacement("praise_result")).resolves.toEqual({ shown: false, reason: "ads_disabled_in_mvp" });
    await expect(adapters.notifications.getPermissionStatus()).resolves.toBe("unsupported");
    await expect(adapters.notifications.scheduleReminder({ id: "reminder-1" })).resolves.toEqual({ status: "blocked", reason: "unsupported" });
  });

  it("uses the browser Notification API when permission is granted", async () => {
    vi.useFakeTimers();
    const shown: Array<{ title: string; body?: string }> = [];
    class FakeNotification {
      static permission: NotificationPermission = "granted";
      static async requestPermission() {
        return "granted" as NotificationPermission;
      }
      constructor(title: string, options?: NotificationOptions) {
        shown.push(options?.body === undefined ? { title } : { title, body: options.body });
      }
    }
    vi.stubGlobal("Notification", FakeNotification);

    const adapters = createMvpPlatformAdapters();
    await expect(adapters.notifications.getPermissionStatus()).resolves.toBe("granted");
    await expect(adapters.notifications.requestPermission()).resolves.toBe("granted");
    await expect(adapters.notifications.scheduleReminder({
      id: "reminder-1",
      title: "내편한마디",
      body: "오늘도 충분히 잘했어.",
      scheduledAt: Date.now() + 1000,
    })).resolves.toEqual({ status: "scheduled" });

    await vi.advanceTimersByTimeAsync(1000);
    expect(shown).toEqual([{ title: "내편한마디", body: "오늘도 충분히 잘했어." }]);
  });
});
