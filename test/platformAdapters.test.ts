import { describe, expect, it } from "vitest";
import { createMvpPlatformAdapters } from "../src/platform/adapters";

describe("MVP platform adapters", () => {
  it("keeps the platform seams enabled only as stubs", async () => {
    const adapters = createMvpPlatformAdapters();

    expect(adapters.auth.status).toBe("stub");
    expect(adapters.payment.status).toBe("stub");
    expect(adapters.ads.status).toBe("stub");
    expect(adapters.storage.status).toBe("stub");
    expect(adapters.analytics.status).toBe("stub");
    expect(adapters.notifications.status).toBe("stub");

    await expect(adapters.auth.getCurrentUser()).resolves.toEqual({ status: "anonymous" });
    await expect(adapters.payment.hasEntitlement("premium_monthly")).resolves.toBe(false);
    await expect(adapters.ads.showPlacement("praise_result")).resolves.toEqual({ shown: false, reason: "ads_disabled_in_mvp" });
    await expect(adapters.notifications.getPermissionStatus()).resolves.toBe("unsupported");
    await expect(adapters.notifications.scheduleReminder({ id: "reminder-1" })).resolves.toEqual({ status: "preview_only", reason: "notifications_stubbed_in_mvp" });
  });
});
