import { useMemo, useState } from "react";
import type { MessageMode, MessageTemplate, NagIntensity, NotificationDisplayMode, Reminder, RepeatRule } from "../../domain/reminders/schema";
import { getNagTemplatesByIntensity, getTemplatesByMode } from "../../domain/reminders/templates";
import type { createI18n } from "../../i18n";
import { displayOptions, getInitialTemplate, repeatOptions, timePresets } from "./reminderViewModel";

interface ReminderCreateProps {
  i18n: ReturnType<typeof createI18n>;
  onCancel(): void;
  onSave(reminder: Reminder): void;
}

const createReminderId = (): string => "reminder-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

const getTemplatesForMode = (mode: MessageMode, intensity: NagIntensity): MessageTemplate[] => {
  if (mode === "praise") return getTemplatesByMode("praise");
  if (mode === "nag") return getNagTemplatesByIntensity(intensity);
  return [];
};

export function ReminderCreate({ i18n, onCancel, onSave }: ReminderCreateProps) {
  const [mode, setMode] = useState<MessageMode>("praise");
  const [nagIntensity, setNagIntensity] = useState<NagIntensity>("soft");
  const templates = useMemo(() => getTemplatesForMode(mode, nagIntensity), [mode, nagIntensity]);
  const getTemplateDisplayText = (template: MessageTemplate): string => i18n.template(template).displayText;
  const initialTemplate = useMemo(
    () => getInitialTemplate(templates, mode === "nag" ? "nag" : "praise", nagIntensity),
    [mode, nagIntensity, templates]
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplate?.id ?? null);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? initialTemplate;
  const [editedText, setEditedText] = useState(() => (initialTemplate ? getTemplateDisplayText(initialTemplate) : ""));
  const [scheduledTime, setScheduledTime] = useState("23:00");
  const [repeatRule, setRepeatRule] = useState<RepeatRule>("daily");
  const [displayMode, setDisplayMode] = useState<NotificationDisplayMode>("fullText");

  const selectMode = (nextMode: MessageMode) => {
    const nextTemplates = getTemplatesForMode(nextMode, nagIntensity);
    const nextTemplate =
      nextMode === "custom" ? null : getInitialTemplate(nextTemplates, nextMode === "nag" ? "nag" : "praise", nagIntensity);
    setMode(nextMode);
    setSelectedTemplateId(nextTemplate?.id ?? null);
    setEditedText(nextMode === "custom" || !nextTemplate ? "" : getTemplateDisplayText(nextTemplate));
  };

  const selectTemplate = (template: MessageTemplate) => {
    setSelectedTemplateId(template.id);
    setEditedText(getTemplateDisplayText(template));
  };

  const save = () => {
    const now = new Date().toISOString();
    const trimmedText = editedText.trim();
    if (!trimmedText) return;

    onSave({
      id: createReminderId(),
      mode,
      ...(selectedTemplate && mode !== "custom" ? { messageTemplateId: selectedTemplate.id } : {}),
      ...(mode === "custom" ? { customText: trimmedText } : {}),
      editedText: trimmedText,
      scheduledTime,
      repeatRule,
      displayMode,
      enabled: true,
      createdAt: now,
      updatedAt: now
    });
  };

  return (
    <section className="reminder-card create-flow" aria-label={i18n.t("create.title")}>
      <div className="section-title-row">
        <h2>{i18n.t("create.title")}</h2>
        <button className="text-button" type="button" onClick={onCancel}>
          {i18n.t("action.cancel")}
        </button>
      </div>

      <div className="segmented" aria-label={i18n.t("create.modeLabel")}>
        {(["praise", "nag", "custom"] as const).map((candidate) => (
          <button
            key={candidate}
            type="button"
            className={mode === candidate ? "is-selected" : ""}
            aria-pressed={mode === candidate}
            onClick={() => selectMode(candidate)}
          >
            {i18n.modeLabel(candidate)}
          </button>
        ))}
      </div>

      {mode === "nag" ? (
        <div className="segmented compact" aria-label={i18n.t("create.intensityLabel")}>
          {(["soft", "direct"] as const).map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={nagIntensity === candidate ? "is-selected" : ""}
              aria-pressed={nagIntensity === candidate}
              onClick={() => {
                setNagIntensity(candidate);
                const nextTemplate = getInitialTemplate(getNagTemplatesByIntensity(candidate), "nag", candidate);
                setSelectedTemplateId(nextTemplate?.id ?? null);
                setEditedText(nextTemplate ? getTemplateDisplayText(nextTemplate) : "");
              }}
            >
              {i18n.nagIntensity(candidate)}
            </button>
          ))}
        </div>
      ) : null}

      {mode !== "custom" ? (
        <div className="template-grid" aria-label={i18n.t("create.templateLabel")}>
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={selectedTemplate?.id === template.id ? "is-selected" : ""}
              onClick={() => selectTemplate(template)}
            >
              {i18n.template(template).displayText}
            </button>
          ))}
        </div>
      ) : null}

      <label className="field">
        <span>{i18n.t("create.messageLabel")}</span>
        <textarea
          aria-label={i18n.t("create.messageLabel")}
          value={editedText}
          onChange={(event) => setEditedText(event.target.value)}
          rows={3}
          placeholder={i18n.t("create.messagePlaceholder")}
        />
      </label>

      <div className="choice-row" aria-label={i18n.t("create.timeLabel")}>
        {timePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={scheduledTime === preset.time ? "is-selected" : ""}
            onClick={() => setScheduledTime(preset.time)}
          >
            {i18n.t(preset.labelKey)}
          </button>
        ))}
      </div>

      <div className="choice-row" aria-label={i18n.t("create.repeatLabel")}>
        {repeatOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={repeatRule === option.id ? "is-selected" : ""}
            onClick={() => setRepeatRule(option.id)}
          >
            {i18n.t(option.labelKey)}
          </button>
        ))}
      </div>

      <div className="choice-row" aria-label={i18n.t("create.displayLabel")}>
        {displayOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={displayMode === option.id ? "is-selected" : ""}
            onClick={() => setDisplayMode(option.id)}
          >
            {i18n.t(option.labelKey)}
          </button>
        ))}
      </div>

      <div className="save-preview">
        <strong>{i18n.t("create.previewTitle")}</strong>
        <p>{editedText || i18n.t("create.messagePlaceholder")}</p>
        <small>
          {i18n.repeatLabel(repeatRule)} · {scheduledTime} · {i18n.displayMode(displayMode)}
        </small>
      </div>

      <button className="save-reminder-button" type="button" onClick={save} disabled={!editedText.trim()}>
        {i18n.t("action.save")}
      </button>
    </section>
  );
}
