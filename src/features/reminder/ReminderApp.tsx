import { useCallback, useEffect, useMemo, useState } from "react";
import { createLocalStorageReminderRepository } from "../../domain/reminders/repository";
import { getTodaysUpcomingReminders } from "../../domain/reminders/schedule";
import type { Reminder, ReminderOccurrenceAction } from "../../domain/reminders/schema";
import type { createI18n } from "../../i18n";
import type { PlatformAdapters } from "../../platform/adapters";
import { ReminderCreate } from "./ReminderCreate";
import { ReminderDetail } from "./ReminderDetail";
import { ReminderHome } from "./ReminderHome";

interface ReminderAppProps {
  i18n: ReturnType<typeof createI18n>;
  platformAdapters: PlatformAdapters;
}

type Screen = "home" | "create" | "detail";

export function ReminderApp({ i18n, platformAdapters }: ReminderAppProps) {
  const repository = useMemo(
    () => createLocalStorageReminderRepository(platformAdapters.storage),
    [platformAdapters.storage]
  );
  const [screen, setScreen] = useState<Screen>("home");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [occurrenceActions, setOccurrenceActions] = useState<ReminderOccurrenceAction[]>([]);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const refreshReminderState = useCallback(async () => {
    const [nextReminders, nextOccurrenceActions] = await Promise.all([
      repository.loadReminders(),
      repository.loadOccurrenceActions()
    ]);
    setReminders(nextReminders);
    setOccurrenceActions(nextOccurrenceActions);
    setNow(new Date());
  }, [repository]);

  useEffect(() => {
    void refreshReminderState();
  }, [refreshReminderState]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [repository]);

  const todayOccurrences = useMemo(
    () => getTodaysUpcomingReminders(reminders, now, occurrenceActions),
    [reminders, now, occurrenceActions]
  );

  const saveReminder = async (reminder: Reminder) => {
    await repository.saveReminder(reminder);
    await platformAdapters.notifications.scheduleReminder({ id: reminder.id });
    await refreshReminderState();
    await platformAdapters.analytics.track("reminder_created", { mode: reminder.mode });
    setScreen("home");
  };

  const selectedReminder = reminders.find((reminder) => reminder.id === selectedReminderId) ?? null;

  return (
    <div className="reminder-app">
      <p className="notification-note">{i18n.t("notification.previewOnly")}</p>
      {screen === "detail" && selectedReminder ? (
        <ReminderDetail
          i18n={i18n}
          reminder={selectedReminder}
          occurrenceActions={occurrenceActions}
          capability={platformAdapters.notifications.capability}
          onBack={() => setScreen("home")}
          onSaveReaction={(reaction) => {
            void repository.saveReaction(reaction);
          }}
          onSaveOccurrenceAction={(action) => {
            void repository.saveOccurrenceAction(action).then(refreshReminderState);
          }}
          onUpdateReminder={(reminder) => {
            void repository.updateReminder(reminder.id, {
              editedText: reminder.editedText,
              ...(reminder.mode === "custom" ? { customText: reminder.editedText } : {}),
              updatedAt: reminder.updatedAt
            }).then(refreshReminderState);
          }}
        />
      ) : screen === "create" ? (
        <ReminderCreate
          i18n={i18n}
          onCancel={() => setScreen("home")}
          onSave={(reminder) => void saveReminder(reminder)}
        />
      ) : (
        <ReminderHome
          i18n={i18n}
          reminders={reminders}
          todayOccurrences={todayOccurrences}
          onCreate={() => setScreen("create")}
          onOpenDetail={(reminderId) => {
            setSelectedReminderId(reminderId);
            setScreen("detail");
          }}
        />
      )}
    </div>
  );
}
