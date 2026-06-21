import {
  isMessageMode,
  isNotificationDisplayMode,
  isRepeatRule,
  type Reminder,
  type ReminderOccurrenceAction,
  type ReminderReaction
} from "./schema";

export const reminderStorageKey = "praise-me:reminders:v1";
export const reminderReactionStorageKey = "praise-me:reminder-reactions:v1";
export const reminderOccurrenceActionStorageKey = "praise-me:reminder-occurrence-actions:v1";

export type ReminderPatch = Partial<Omit<Reminder, "id" | "createdAt">>;

export interface ReminderStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ReminderRepository {
  loadReminders(): Promise<Reminder[]>;
  saveReminder(reminder: Reminder): Promise<void>;
  updateReminder(id: string, patch: ReminderPatch): Promise<void>;
  deleteReminder(id: string): Promise<void>;
  saveReaction(reaction: ReminderReaction): Promise<void>;
  loadReactions(reminderId?: string): Promise<ReminderReaction[]>;
  saveOccurrenceAction(action: ReminderOccurrenceAction): Promise<void>;
  loadOccurrenceActions(reminderId?: string): Promise<ReminderOccurrenceAction[]>;
}

const cloneReminder = (reminder: Reminder): Reminder => {
  const cloned: Reminder = { ...reminder };
  if (reminder.customDays) {
    cloned.customDays = [...reminder.customDays];
  } else {
    delete cloned.customDays;
  }
  return cloned;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isValidDateLike = (value: unknown): value is string | Date =>
  (typeof value === "string" || value instanceof Date) && !Number.isNaN(new Date(value).getTime());

const isCustomDays = (value: unknown): value is number[] | undefined =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every((day) => Number.isInteger(day) && Number(day) >= 0 && Number(day) <= 6));

const isReminder = (value: unknown): value is Reminder =>
  isRecord(value) &&
  typeof value.id === "string" &&
  isMessageMode(value.mode) &&
  isOptionalString(value.messageTemplateId) &&
  isOptionalString(value.customText) &&
  typeof value.editedText === "string" &&
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value.scheduledTime)) &&
  isRepeatRule(value.repeatRule) &&
  isCustomDays(value.customDays) &&
  isNotificationDisplayMode(value.displayMode) &&
  typeof value.enabled === "boolean" &&
  typeof value.createdAt === "string" &&
  typeof value.updatedAt === "string";

const isReaction = (value: unknown): value is ReminderReaction =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.reminderId === "string" &&
  (value.type === "liked" || value.type === "disliked" || value.type === "editedFromDetail") &&
  typeof value.createdAt === "string";

type OccurrenceActionRow = Omit<ReminderOccurrenceAction, "scheduledFor" | "sourceScheduledFor"> & {
  scheduledFor: string | Date;
  sourceScheduledFor?: string | Date;
};

const isOccurrenceActionRow = (value: unknown): value is OccurrenceActionRow =>
  isRecord(value) &&
  typeof value.reminderId === "string" &&
  typeof value.text === "string" &&
  (value.action === "snoozed" || value.action === "skipped") &&
  isValidDateLike(value.scheduledFor) &&
  (value.sourceScheduledFor === undefined || isValidDateLike(value.sourceScheduledFor)) &&
  typeof value.createdAt === "string";

const cloneReaction = (reaction: ReminderReaction): ReminderReaction => ({ ...reaction });

const cloneOccurrenceAction = (action: ReminderOccurrenceAction): ReminderOccurrenceAction => ({
  ...action,
  scheduledFor: new Date(action.scheduledFor),
  sourceScheduledFor: new Date(action.sourceScheduledFor ?? action.scheduledFor)
});

const reviveOccurrenceAction = (value: OccurrenceActionRow): ReminderOccurrenceAction => ({
  ...value,
  scheduledFor: new Date(value.scheduledFor),
  sourceScheduledFor: new Date(value.sourceScheduledFor ?? value.scheduledFor)
});

export const createLocalStorageReminderRepository = (
  storage: ReminderStorage
): ReminderRepository => {
  const loadJsonArray = <T>(key: string, guard: (value: unknown) => value is T): T[] => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(guard) : [];
    } catch {
      return [];
    }
  };

  const load = (): Reminder[] => loadJsonArray(reminderStorageKey, isReminder).map(cloneReminder);

  const saveAll = (reminders: Reminder[]) => {
    storage.setItem(reminderStorageKey, JSON.stringify(reminders.map(cloneReminder)));
  };

  const loadReactions = (): ReminderReaction[] =>
    loadJsonArray(reminderReactionStorageKey, isReaction).map(cloneReaction);

  const saveAllReactions = (reactions: ReminderReaction[]) => {
    storage.setItem(reminderReactionStorageKey, JSON.stringify(reactions.map(cloneReaction)));
  };

  const loadOccurrenceActions = (): ReminderOccurrenceAction[] =>
    loadJsonArray(reminderOccurrenceActionStorageKey, isOccurrenceActionRow).map(reviveOccurrenceAction);

  const saveAllOccurrenceActions = (actions: ReminderOccurrenceAction[]) => {
    storage.setItem(
      reminderOccurrenceActionStorageKey,
      JSON.stringify(actions.map(cloneOccurrenceAction))
    );
  };

  return {
    async loadReminders() {
      return load();
    },

    async saveReminder(reminder) {
      const reminders = load();
      saveAll([cloneReminder(reminder), ...reminders.filter((candidate) => candidate.id !== reminder.id)]);
    },

    async updateReminder(id, patch) {
      const reminders = load().map((reminder) =>
        reminder.id === id ? cloneReminder({ ...reminder, ...patch }) : reminder
      );
      saveAll(reminders);
    },

    async deleteReminder(id) {
      saveAll(load().filter((reminder) => reminder.id !== id));
    },

    async saveReaction(reaction) {
      saveAllReactions([cloneReaction(reaction), ...loadReactions()]);
    },

    async loadReactions(reminderId) {
      const reactions = loadReactions();
      return (reminderId ? reactions.filter((reaction) => reaction.reminderId === reminderId) : reactions)
        .map(cloneReaction);
    },

    async saveOccurrenceAction(action) {
      saveAllOccurrenceActions([cloneOccurrenceAction(action), ...loadOccurrenceActions()]);
    },

    async loadOccurrenceActions(reminderId) {
      const actions = loadOccurrenceActions();
      return (reminderId ? actions.filter((action) => action.reminderId === reminderId) : actions)
        .map(cloneOccurrenceAction);
    }
  };
};
