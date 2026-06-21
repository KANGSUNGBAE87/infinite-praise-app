import { useState } from "react";
import { getNextOccurrence, skipNextOccurrence, snoozeOccurrence } from "../../domain/reminders/schedule";
import type { Reminder, ReminderOccurrenceAction, ReminderReaction } from "../../domain/reminders/schema";
import type { createI18n } from "../../i18n";
import type { NotificationCapability } from "../../platform/adapters";
import { formatReminderSummary } from "./reminderViewModel";

interface ReminderDetailProps {
  i18n: ReturnType<typeof createI18n>;
  reminder: Reminder;
  occurrenceActions: ReminderOccurrenceAction[];
  capability: NotificationCapability;
  onBack(): void;
  onSaveReaction(reaction: ReminderReaction): void;
  onSaveOccurrenceAction(action: ReminderOccurrenceAction): void;
  onUpdateReminder(reminder: Reminder): void;
}

const createId = (prefix: string): string =>
  prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

export function ReminderDetail({
  i18n,
  reminder,
  occurrenceActions,
  capability,
  onBack,
  onSaveReaction,
  onSaveOccurrenceAction,
  onUpdateReminder
}: ReminderDetailProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reminder.editedText);

  const saveReaction = (type: ReminderReaction["type"]) => {
    onSaveReaction({
      id: createId("reaction"),
      reminderId: reminder.id,
      type,
      createdAt: new Date().toISOString()
    });
    setStatusMessage(type === "liked" ? i18n.t("detail.feedbackLiked") : i18n.t("detail.feedbackDisliked"));
  };

  const saveOccurrenceAction = (action: "snoozed" | "skipped") => {
    const occurrence = getNextOccurrence(reminder, new Date(), occurrenceActions) ?? {
      reminderId: reminder.id,
      scheduledFor: new Date(),
      sourceScheduledFor: new Date(),
      text: reminder.editedText
    };
    const nextAction = action === "snoozed" ? snoozeOccurrence(occurrence, 10) : skipNextOccurrence(occurrence);
    onSaveOccurrenceAction(nextAction);
    setStatusMessage(action === "snoozed" ? i18n.t("detail.snoozed") : i18n.t("detail.skipped"));
  };

  const saveEditedText = () => {
    const trimmed = editedText.trim();
    if (!trimmed) return;
    onUpdateReminder({
      ...reminder,
      editedText: trimmed,
      ...(reminder.mode === "custom" ? { customText: trimmed } : {}),
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
    setStatusMessage(i18n.t("detail.updated"));
  };

  return (
    <section className="reminder-card detail-card" aria-label={i18n.t("detail.title")}>
      <div className="section-title-row">
        <h2>{i18n.t("detail.title")}</h2>
        <button className="text-button" type="button" onClick={onBack}>
          {i18n.t("action.back")}
        </button>
      </div>

      <p className="notification-status">
        {i18n.t("notification.statusLabel")}: {i18n.notificationCapability(capability)}
      </p>

      {isEditing ? (
        <div className="detail-edit">
          <label className="field">
            <span>{i18n.t("create.messageLabel")}</span>
            <textarea
              aria-label={i18n.t("create.messageLabel")}
              value={editedText}
              onChange={(event) => setEditedText(event.target.value)}
              rows={3}
            />
          </label>
          <button className="save-reminder-button" type="button" onClick={saveEditedText}>
            {i18n.t("action.saveChanges")}
          </button>
        </div>
      ) : (
        <p className="detail-message">{reminder.editedText}</p>
      )}

      <dl className="detail-meta">
        <div>
          <dt>{i18n.t("create.modeLabel")}</dt>
          <dd>{i18n.modeLabel(reminder.mode)}</dd>
        </div>
        <div>
          <dt>{i18n.t("create.repeatLabel")}</dt>
          <dd>{formatReminderSummary(reminder, (repeatRule) => i18n.repeatLabel(repeatRule))}</dd>
        </div>
        <div>
          <dt>{i18n.t("create.displayLabel")}</dt>
          <dd>{i18n.displayMode(reminder.displayMode)}</dd>
        </div>
      </dl>

      <div className="detail-actions">
        <button type="button" onClick={() => saveReaction("liked")}>
          {i18n.t("detail.like")}
        </button>
        <button type="button" onClick={() => saveReaction("disliked")}>
          {i18n.t("detail.dislike")}
        </button>
        <button type="button" onClick={() => setIsEditing(true)}>
          {i18n.t("detail.edit")}
        </button>
        <button type="button" onClick={() => saveOccurrenceAction("snoozed")}>
          {i18n.t("detail.snooze")}
        </button>
        <button type="button" onClick={() => saveOccurrenceAction("skipped")}>
          {i18n.t("detail.skip")}
        </button>
      </div>

      {statusMessage ? (
        <p className="detail-status" role="status">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
