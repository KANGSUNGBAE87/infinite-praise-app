import type { Reminder, ReminderOccurrence } from "../../domain/reminders/schema";
import type { createI18n } from "../../i18n";
import { formatReminderSummary } from "./reminderViewModel";

interface ReminderHomeProps {
  i18n: ReturnType<typeof createI18n>;
  reminders: Reminder[];
  todayOccurrences: ReminderOccurrence[];
  onCreate(): void;
  onOpenDetail(reminderId: string): void;
}

export function ReminderHome({
  i18n,
  reminders,
  todayOccurrences,
  onCreate,
  onOpenDetail
}: ReminderHomeProps) {
  const activeReminders = reminders.filter((reminder) => reminder.enabled);
  const getVisibleText = (reminder: Reminder | undefined, text: string): string =>
    reminder?.displayMode === "private" ? i18n.t("display.privateMessage") : text;

  return (
    <>
      <section className="reminder-card today-card" aria-label={i18n.t("home.todayTitle")}>
        <div className="section-title-row">
          <h2>{i18n.t("home.todayTitle")}</h2>
        </div>
        {todayOccurrences.length > 0 ? (
          <ul className="reminder-list">
            {todayOccurrences.map((occurrence) => (
              <li key={occurrence.reminderId + occurrence.scheduledFor.toISOString()}>
                <button type="button" onClick={() => onOpenDetail(occurrence.reminderId)}>
                  <span className="reminder-time">
                    {occurrence.scheduledFor.toLocaleTimeString(i18n.locale === "ko" ? "ko-KR" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  <span className="reminder-text">
                    {getVisibleText(
                      reminders.find((reminder) => reminder.id === occurrence.reminderId),
                      occurrence.text
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{i18n.t("home.todayEmpty")}</p>
        )}
      </section>

      <section className="reminder-card active-reminders" aria-label={i18n.t("home.activeTitle")}>
        <div className="section-title-row">
          <h2>{i18n.t("home.activeTitle")}</h2>
          {activeReminders.length > 0 ? <span>{activeReminders.length}</span> : null}
        </div>
        {activeReminders.length > 0 ? (
          <ul className="reminder-list">
            {activeReminders.map((reminder) => (
              <li key={reminder.id}>
                <button type="button" onClick={() => onOpenDetail(reminder.id)}>
                  <span className={"mode-dot " + reminder.mode} aria-hidden="true" />
                  <span className="reminder-text">{getVisibleText(reminder, reminder.editedText)}</span>
                  <span className="reminder-summary">
                    {formatReminderSummary(reminder, (repeatRule) => i18n.repeatLabel(repeatRule))}
                  </span>
                  <span className="reminder-display">{i18n.displayMode(reminder.displayMode)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{i18n.t("home.activeEmpty")}</p>
        )}
      </section>

      <button className="create-reminder-button" type="button" onClick={onCreate}>
        {i18n.t("home.createCta")}
      </button>
    </>
  );
}
