import { describe, expect, it } from "vitest";
import {
  getNextOccurrence,
  getTodaysUpcomingReminders,
  skipNextOccurrence,
  snoozeOccurrence
} from "../src/domain/reminders/schedule";
import type { Reminder, ReminderOccurrenceAction } from "../src/domain/reminders/schema";

const createReminder = (overrides: Partial<Reminder>): Reminder => ({
  id: "reminder-1",
  mode: "praise",
  messageTemplateId: "praise-001",
  editedText: "오늘 버틴 것만으로도 잘했어.",
  scheduledTime: "14:00",
  repeatRule: "daily",
  displayMode: "fullText",
  enabled: true,
  createdAt: "2026-06-16T09:00:00.000Z",
  updatedAt: "2026-06-16T09:00:00.000Z",
  ...overrides
});

describe("reminder schedule rules", () => {
  it("finds the closest upcoming occurrence for today when possible", () => {
    const now = new Date(2026, 5, 16, 13, 30);
    const occurrence = getNextOccurrence(createReminder({ scheduledTime: "14:00" }), now);

    expect(occurrence?.reminderId).toBe("reminder-1");
    expect(occurrence?.scheduledFor.getFullYear()).toBe(2026);
    expect(occurrence?.scheduledFor.getMonth()).toBe(5);
    expect(occurrence?.scheduledFor.getDate()).toBe(16);
    expect(occurrence?.scheduledFor.getHours()).toBe(14);
    expect(occurrence?.scheduledFor.getMinutes()).toBe(0);
  });

  it("moves a daily occurrence to tomorrow when today's time has passed", () => {
    const now = new Date(2026, 5, 16, 15, 0);
    const occurrence = getNextOccurrence(createReminder({ scheduledTime: "14:00" }), now);

    expect(occurrence?.scheduledFor.getDate()).toBe(17);
    expect(occurrence?.scheduledFor.getHours()).toBe(14);
  });

  it("sorts today's upcoming enabled reminders and excludes disabled ones", () => {
    const now = new Date(2026, 5, 16, 9, 0);
    const reminders = [
      createReminder({ id: "later", scheduledTime: "18:00" }),
      createReminder({ id: "disabled", scheduledTime: "10:00", enabled: false }),
      createReminder({ id: "sooner", scheduledTime: "10:30" })
    ];

    const occurrences = getTodaysUpcomingReminders(reminders, now);

    expect(occurrences.map((occurrence) => occurrence.reminderId)).toEqual(["sooner", "later"]);
  });

  it("supports v0.2 snooze and skip records without disabling the reminder", () => {
    const now = new Date(2026, 5, 16, 9, 0);
    const occurrence = getNextOccurrence(createReminder({ scheduledTime: "09:05" }), now)!;
    const snoozed = snoozeOccurrence(occurrence, 10);
    const skipped = skipNextOccurrence(occurrence);

    expect(snoozed.action).toBe("snoozed");
    expect(snoozed.scheduledFor.getMinutes()).toBe(15);
    expect(skipped.action).toBe("skipped");
    expect(skipped.reminderId).toBe("reminder-1");
  });

  it("applies snooze actions to the next local preview occurrence", () => {
    const now = new Date(2026, 5, 16, 9, 0);
    const reminder = createReminder({ scheduledTime: "09:05" });
    const occurrence = getNextOccurrence(reminder, now)!;
    const snoozed = snoozeOccurrence(occurrence, 10, "2026-06-16T00:00:00.000Z");

    const nextOccurrence = getNextOccurrence(reminder, now, [snoozed]);
    const todaysOccurrences = getTodaysUpcomingReminders([reminder], now, [snoozed]);

    expect(nextOccurrence?.scheduledFor.getHours()).toBe(9);
    expect(nextOccurrence?.scheduledFor.getMinutes()).toBe(15);
    expect(nextOccurrence?.sourceScheduledFor?.getMinutes()).toBe(5);
    expect(todaysOccurrences[0]?.scheduledFor.getMinutes()).toBe(15);
  });

  it("applies skip actions to the next local preview occurrence", () => {
    const now = new Date(2026, 5, 16, 9, 0);
    const reminder = createReminder({ scheduledTime: "09:05" });
    const occurrence = getNextOccurrence(reminder, now)!;
    const skipped = skipNextOccurrence(occurrence, "2026-06-16T00:00:00.000Z");

    const nextOccurrence = getNextOccurrence(reminder, now, [skipped]);
    const todaysOccurrences = getTodaysUpcomingReminders([reminder], now, [skipped]);

    expect(nextOccurrence?.scheduledFor.getDate()).toBe(17);
    expect(todaysOccurrences).toEqual([]);
  });

  it("uses the newest occurrence action for the same source occurrence", () => {
    const now = new Date(2026, 5, 16, 9, 0);
    const reminder = createReminder({ scheduledTime: "09:05" });
    const occurrence = getNextOccurrence(reminder, now)!;
    const older = snoozeOccurrence(occurrence, 10, "2026-06-16T00:00:00.000Z");
    const newer: ReminderOccurrenceAction = {
      ...older,
      action: "skipped",
      scheduledFor: new Date(occurrence.scheduledFor),
      createdAt: "2026-06-16T00:01:00.000Z"
    };

    expect(getTodaysUpcomingReminders([reminder], now, [older, newer])).toEqual([]);
  });
});
