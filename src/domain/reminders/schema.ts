export const MESSAGE_MODES = ["praise", "nag", "custom"] as const;
export const NAG_INTENSITIES = ["soft", "direct"] as const;
export const NOTIFICATION_DISPLAY_MODES = ["fullText", "private"] as const;
export const REPEAT_RULES = ["daily", "weekday", "weekend", "customDays"] as const;

export type MessageMode = (typeof MESSAGE_MODES)[number];
export type NagIntensity = (typeof NAG_INTENSITIES)[number];
export type NotificationDisplayMode = (typeof NOTIFICATION_DISPLAY_MODES)[number];
export type RepeatRule = (typeof REPEAT_RULES)[number];

export interface MessageTemplate {
  id: string;
  mode: Exclude<MessageMode, "custom">;
  intensity?: NagIntensity;
  displayText: string;
  notificationText: string;
  tags: string[];
  status: "release" | "draft";
  voiceCandidate?: boolean;
}

export interface Reminder {
  id: string;
  mode: MessageMode;
  messageTemplateId?: string;
  customText?: string;
  editedText: string;
  scheduledTime: string;
  repeatRule: RepeatRule;
  customDays?: number[];
  displayMode: NotificationDisplayMode;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReminderReactionType = "liked" | "disliked" | "editedFromDetail";
export type ReminderOccurrenceActionType = "snoozed" | "skipped";

export interface ReminderReaction {
  id: string;
  reminderId: string;
  type: ReminderReactionType;
  createdAt: string;
}

export interface ReminderOccurrence {
  reminderId: string;
  scheduledFor: Date;
  sourceScheduledFor?: Date;
  text: string;
}

export interface ReminderOccurrenceAction extends ReminderOccurrence {
  action: ReminderOccurrenceActionType;
  createdAt: string;
}

const includesString = <T extends readonly string[]>(values: T, value: unknown): value is T[number] =>
  typeof value === "string" && values.includes(value);

export const isMessageMode = (value: unknown): value is MessageMode =>
  includesString(MESSAGE_MODES, value);

export const isRepeatRule = (value: unknown): value is RepeatRule =>
  includesString(REPEAT_RULES, value);

export const isNotificationDisplayMode = (value: unknown): value is NotificationDisplayMode =>
  includesString(NOTIFICATION_DISPLAY_MODES, value);
