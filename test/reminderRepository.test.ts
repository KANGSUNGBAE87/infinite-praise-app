import { beforeEach, describe, expect, it } from "vitest";
import {
  createLocalStorageReminderRepository,
  reminderOccurrenceActionStorageKey,
  reminderStorageKey,
  type ReminderPatch
} from "../src/domain/reminders/repository";
import type { Reminder } from "../src/domain/reminders/schema";

const baseReminder: Reminder = {
  id: "reminder-1",
  mode: "praise",
  messageTemplateId: "praise-001",
  editedText: "오늘 버틴 것만으로도 잘했어.",
  scheduledTime: "23:00",
  repeatRule: "daily",
  displayMode: "fullText",
  enabled: true,
  createdAt: "2026-06-16T09:00:00.000Z",
  updatedAt: "2026-06-16T09:00:00.000Z"
};

describe("local storage reminder repository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves reminders under the v1 reminder key and returns immutable copies", async () => {
    const repository = createLocalStorageReminderRepository(window.localStorage);

    await repository.saveReminder(baseReminder);
    const saved = await repository.loadReminders();
    saved[0]!.editedText = "mutated outside";

    const reloaded = await repository.loadReminders();
    expect(window.localStorage.getItem(reminderStorageKey)).toContain("reminder-1");
    expect(reloaded).toEqual([baseReminder]);
  });

  it("updates, disables, and deletes reminders by id", async () => {
    const repository = createLocalStorageReminderRepository(window.localStorage);
    const patch: ReminderPatch = {
      enabled: false,
      editedText: "오늘은 여기까지 해도 돼.",
      updatedAt: "2026-06-16T10:00:00.000Z"
    };

    await repository.saveReminder(baseReminder);
    await repository.updateReminder("reminder-1", patch);
    await expect(repository.loadReminders()).resolves.toEqual([{ ...baseReminder, ...patch }]);

    await repository.deleteReminder("reminder-1");
    await expect(repository.loadReminders()).resolves.toEqual([]);
  });

  it("returns an empty list for missing or invalid storage data", async () => {
    const repository = createLocalStorageReminderRepository(window.localStorage);

    await expect(repository.loadReminders()).resolves.toEqual([]);

    window.localStorage.setItem(reminderStorageKey, "{not valid json");

    await expect(repository.loadReminders()).resolves.toEqual([]);
  });

  it("filters malformed reminder rows from storage", async () => {
    const repository = createLocalStorageReminderRepository(window.localStorage);
    window.localStorage.setItem(
      reminderStorageKey,
      JSON.stringify([
        { id: "broken-row", mode: "praise" },
        baseReminder,
        { ...baseReminder, id: "bad-mode", mode: "therapy" },
        { ...baseReminder, id: "bad-display", displayMode: "public" }
      ])
    );

    await expect(repository.loadReminders()).resolves.toEqual([baseReminder]);
  });

  it("stores v0.2 reactions and occurrence actions separately from reminders", async () => {
    const repository = createLocalStorageReminderRepository(window.localStorage);

    await repository.saveReminder(baseReminder);
    await repository.saveReaction({
      id: "reaction-1",
      reminderId: "reminder-1",
      type: "liked",
      createdAt: "2026-06-16T11:00:00.000Z"
    });
    await repository.saveOccurrenceAction({
      reminderId: "reminder-1",
      text: baseReminder.editedText,
      action: "snoozed",
      scheduledFor: new Date(2026, 5, 16, 23, 10),
      sourceScheduledFor: new Date(2026, 5, 16, 23, 0),
      createdAt: "2026-06-16T11:01:00.000Z"
    });

    await expect(repository.loadReactions("reminder-1")).resolves.toEqual([
      {
        id: "reaction-1",
        reminderId: "reminder-1",
        type: "liked",
        createdAt: "2026-06-16T11:00:00.000Z"
      }
    ]);
    const actions = await repository.loadOccurrenceActions("reminder-1");
    expect(actions[0]?.action).toBe("snoozed");
    expect(actions[0]?.scheduledFor).toEqual(new Date(2026, 5, 16, 23, 10));
    expect(actions[0]?.sourceScheduledFor).toEqual(new Date(2026, 5, 16, 23, 0));
  });

  it("revives legacy occurrence actions with sourceScheduledFor fallback", async () => {
    const repository = createLocalStorageReminderRepository(window.localStorage);
    window.localStorage.setItem(
      reminderOccurrenceActionStorageKey,
      JSON.stringify([
        {
          reminderId: "reminder-1",
          text: baseReminder.editedText,
          action: "skipped",
          scheduledFor: "2026-06-16T14:00:00.000Z",
          createdAt: "2026-06-16T11:01:00.000Z"
        }
      ])
    );

    const actions = await repository.loadOccurrenceActions("reminder-1");

    expect(actions[0]?.scheduledFor).toEqual(new Date("2026-06-16T14:00:00.000Z"));
    expect(actions[0]?.sourceScheduledFor).toEqual(new Date("2026-06-16T14:00:00.000Z"));
  });
});
