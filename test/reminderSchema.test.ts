import { describe, expect, it } from "vitest";
import {
  isMessageMode,
  isNotificationDisplayMode,
  isRepeatRule,
  MESSAGE_MODES,
  NAG_INTENSITIES,
  NOTIFICATION_DISPLAY_MODES,
  REPEAT_RULES,
  type Reminder
} from "../src/domain/reminders/schema";

describe("reminder schema", () => {
  it("exposes the v0.1 message modes without a strong nag mode", () => {
    expect(MESSAGE_MODES).toEqual(["praise", "nag", "custom"]);
    expect(NAG_INTENSITIES).toEqual(["soft", "direct"]);
    expect(isMessageMode("praise")).toBe(true);
    expect(isMessageMode("nag")).toBe(true);
    expect(isMessageMode("custom")).toBe(true);
    expect(isMessageMode("strong")).toBe(false);
  });

  it("keeps repeat and notification display options explicit", () => {
    expect(REPEAT_RULES).toEqual(["daily", "weekday", "weekend", "customDays"]);
    expect(NOTIFICATION_DISPLAY_MODES).toEqual(["fullText", "private"]);
    expect(isRepeatRule("weekday")).toBe(true);
    expect(isRepeatRule("monthly")).toBe(false);
    expect(isNotificationDisplayMode("private")).toBe(true);
    expect(isNotificationDisplayMode("hidden")).toBe(false);
  });

  it("supports local reminder records for praise, nag, and custom text", () => {
    const reminder: Reminder = {
      id: "reminder-1",
      mode: "custom",
      customText: "밤 11시에는 폰 내려놓기.",
      editedText: "밤 11시에는 폰 내려놓기.",
      scheduledTime: "23:00",
      repeatRule: "daily",
      displayMode: "private",
      enabled: true,
      createdAt: "2026-06-16T09:00:00.000Z",
      updatedAt: "2026-06-16T09:00:00.000Z"
    };

    expect(reminder.mode).toBe("custom");
    expect(reminder.displayMode).toBe("private");
  });
});
