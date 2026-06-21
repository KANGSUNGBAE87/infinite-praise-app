import type { Reminder, ReminderOccurrence, ReminderOccurrenceAction } from "./schema";

const searchWindowDays = 14;

const parseScheduledTime = (scheduledTime: string): { hours: number; minutes: number } | null => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(scheduledTime);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const isWeekend = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;
const isWeekday = (date: Date): boolean => !isWeekend(date);

const repeatsOnDate = (reminder: Reminder, date: Date): boolean => {
  if (reminder.repeatRule === "daily") return true;
  if (reminder.repeatRule === "weekday") return isWeekday(date);
  if (reminder.repeatRule === "weekend") return isWeekend(date);
  return reminder.customDays?.includes(date.getDay()) ?? false;
};

const candidateForDate = (reminder: Reminder, date: Date): Date | null => {
  const time = parseScheduledTime(reminder.scheduledTime);
  if (!time || !repeatsOnDate(reminder, date)) return null;

  const candidate = startOfDay(date);
  candidate.setHours(time.hours, time.minutes, 0, 0);
  return candidate;
};

const getSourceScheduledFor = (action: ReminderOccurrenceAction): Date =>
  new Date(action.sourceScheduledFor ?? action.scheduledFor);

const getLatestActionForSource = (
  reminderId: string,
  sourceScheduledFor: Date,
  actions: ReminderOccurrenceAction[]
): ReminderOccurrenceAction | null =>
  actions
    .filter(
      (action) =>
        action.reminderId === reminderId &&
        getSourceScheduledFor(action).getTime() === sourceScheduledFor.getTime()
    )
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0] ?? null;

const applyOccurrenceAction = (
  reminder: Reminder,
  sourceScheduledFor: Date,
  actions: ReminderOccurrenceAction[]
): ReminderOccurrence | null => {
  const latestAction = getLatestActionForSource(reminder.id, sourceScheduledFor, actions);
  if (latestAction?.action === "skipped") return null;

  return {
    reminderId: reminder.id,
    scheduledFor: latestAction?.action === "snoozed" ? new Date(latestAction.scheduledFor) : new Date(sourceScheduledFor),
    sourceScheduledFor: new Date(sourceScheduledFor),
    text: latestAction?.text ?? reminder.editedText
  };
};

export const getNextOccurrence = (
  reminder: Reminder,
  now = new Date(),
  actions: ReminderOccurrenceAction[] = []
): ReminderOccurrence | null => {
  if (!reminder.enabled) return null;

  for (let dayOffset = 0; dayOffset < searchWindowDays; dayOffset += 1) {
    const day = addDays(now, dayOffset);
    const sourceScheduledFor = candidateForDate(reminder, day);
    if (sourceScheduledFor) {
      const occurrence = applyOccurrenceAction(reminder, sourceScheduledFor, actions);
      if (occurrence && occurrence.scheduledFor.getTime() >= now.getTime()) {
        return occurrence;
      }
    }
  }

  return null;
};

export const getTodaysUpcomingReminders = (
  reminders: Reminder[],
  now = new Date(),
  actions: ReminderOccurrenceAction[] = []
): ReminderOccurrence[] => {
  const today = startOfDay(now).getTime();

  return reminders
    .map((reminder) => getNextOccurrence(reminder, now, actions))
    .filter((occurrence): occurrence is ReminderOccurrence => {
      if (!occurrence) return false;
      return startOfDay(occurrence.scheduledFor).getTime() === today;
    })
    .sort((left, right) => left.scheduledFor.getTime() - right.scheduledFor.getTime());
};

export const snoozeOccurrence = (
  occurrence: ReminderOccurrence,
  minutes = 10,
  createdAt = new Date().toISOString()
): ReminderOccurrenceAction => {
  const scheduledFor = new Date(occurrence.scheduledFor);
  scheduledFor.setMinutes(scheduledFor.getMinutes() + minutes);
  return {
    ...occurrence,
    scheduledFor,
    sourceScheduledFor: new Date(occurrence.sourceScheduledFor ?? occurrence.scheduledFor),
    action: "snoozed",
    createdAt
  };
};

export const skipNextOccurrence = (
  occurrence: ReminderOccurrence,
  createdAt = new Date().toISOString()
): ReminderOccurrenceAction => ({
  ...occurrence,
  scheduledFor: new Date(occurrence.scheduledFor),
  sourceScheduledFor: new Date(occurrence.sourceScheduledFor ?? occurrence.scheduledFor),
  action: "skipped",
  createdAt
});
