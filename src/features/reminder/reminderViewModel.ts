import type { MessageTemplate, Reminder } from "../../domain/reminders/schema";

export const timePresets = [
  { id: "morning", labelKey: "timePreset.morning", time: "08:30" },
  { id: "beforeLunch", labelKey: "timePreset.beforeLunch", time: "11:30" },
  { id: "afternoon", labelKey: "timePreset.afternoon", time: "14:00" },
  { id: "beforeLeave", labelKey: "timePreset.beforeLeave", time: "18:00" },
  { id: "bedtime", labelKey: "timePreset.bedtime", time: "23:00" }
] as const;

export const repeatOptions = [
  { id: "daily", labelKey: "repeat.daily" },
  { id: "weekday", labelKey: "repeat.weekday" },
  { id: "weekend", labelKey: "repeat.weekend" }
] as const;

export const displayOptions = [
  { id: "fullText", labelKey: "display.fullText" },
  { id: "private", labelKey: "display.private" }
] as const;

export const formatReminderSummary = (
  reminder: Reminder,
  translateRepeat: (repeatRule: Reminder["repeatRule"]) => string
): string => `${translateRepeat(reminder.repeatRule)} · ${reminder.scheduledTime}`;

export const getInitialTemplate = (
  templates: MessageTemplate[],
  mode: "praise" | "nag",
  intensity: "soft" | "direct" = "soft"
): MessageTemplate | null => {
  const matched = templates.find((template) => {
    if (template.mode !== mode) return false;
    if (mode === "nag") return template.intensity === intensity;
    return true;
  });

  return matched ?? null;
};
