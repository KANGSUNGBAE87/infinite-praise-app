import { useEffect, useMemo, useRef, useState } from "react";
import { createI18n, isLocale, localeOptions, type Locale } from "./i18n";
import { sanitizeAnalytics } from "./core/analyticsSanitizer";
import { createCandidateReportAdapter } from "./core/candidateReporting";
import {
  createMessageGenerationAdapter,
  type MessageCandidate,
  type ExpressionVariant,
  type MessageFeeling,
  type MessageIntensity,
  type MessageMode,
  type MessageSituation,
  type MessageTone,
} from "./core/messageGeneration";
import { classifyMessageSafety } from "./core/messageSafety";
import { createMvpPlatformAdapters } from "./platform/adapters";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type AppMessageMode = MessageMode | "custom";
type AxisKey = "situation" | "feeling" | "tone" | "intensity";
type CheckinAction = "keep" | "edit" | "skip";
type InterestAction = "dismissed" | "registered";

type VaultItem = {
  id: string;
  text: string;
  savedAt: number;
};

type AppState = {
  sourceTag: string;
  step: Step;
  targetConfirmed: boolean;
  messageMode: AppMessageMode;
  messageSituation: MessageSituation;
  messageFeeling: MessageFeeling;
  messageTone: MessageTone;
  messageIntensity: MessageIntensity;
  generationContext: string;
  generationStatus: "idle" | "loading" | "success" | "fallback" | "blocked" | "error";
  generatedCandidates: MessageCandidate[];
  selectedCandidateId: string | null;
  aiDisclosureSeen: boolean;
  reportedCandidateIds: string[];
  selectedPraiseId: string | null;
  selectedPraise: string;
  selectedNotificationText: string;
  selectedEmotion: string | null;
  rewriteText: string;
  scheduleTime: string;
  previewText: string;
  notificationStatus: "idle" | "unsupported" | "prompt" | "denied" | "scheduled" | "blocked" | "preview_only";
  notificationMessage: string;
  checkinAction: CheckinAction | null;
  reopenSource: "manual" | "notification" | "unknown";
  safetyState: "safe" | "caution" | "blocked";
  interestAction: InterestAction | null;
  sessionPhase: "initial" | "reopened";
  savedAt: number | null;
  scheduleTimes: string[];
  vaultItems: VaultItem[];
  weeklyCare: number[];
  navTab: "home" | "vault" | "settings";
};

const allPraiseOptions = [
  { id: "p1", ko: "오늘 버틴 것만으로도 충분히 잘했어.", en: "Just making it through today was more than enough." },
  { id: "p2", ko: "아무도 몰라도, 네가 해낸 건 사라지지 않아.", en: "Even if no one knows, what you did today doesn't disappear." },
  { id: "p3", ko: "여기까지 온 것도 이미 대단한 일이야.", en: "Just getting here was already an achievement." },
  { id: "p4", ko: "한 번 멈춘 뒤 다시 가도 괜찮아.", en: "It is okay to pause and go again." },
  { id: "p5", ko: "오늘 한 일은 사라지지 않아.", en: "What you did today does not disappear." },
] as const;

const initialPraiseIds = ["p1", "p2", "p3"];
const revealPraiseIds = ["p4", "p5"];
const aiUnavailableReasonCodes = new Set(["network", "invalid_response"]);

const progressLabels = [
  "progress.start",
  "progress.choose",
  "progress.edit",
  "progress.save",
  "progress.check",
  "progress.done",
] as const;

const choiceIcons: Record<string, string> = {
  p1: "⭐",
  p2: "🌸",
  p3: "🌙",
  p4: "💫",
  p5: "🌿",
};

const emotionChips = [
  { id: "e1", icon: "🎀", color: "peach", i18nKey: "emotion.e1", descKey: "emotion.e1desc" },
  { id: "e2", icon: "☁️", color: "mint", i18nKey: "emotion.e2", descKey: "emotion.e2desc" },
  { id: "e3", icon: "↗️", color: "yellow", i18nKey: "emotion.e3", descKey: "emotion.e3desc" },
  { id: "e4", icon: "💜", color: "lilac", i18nKey: "emotion.e4", descKey: "emotion.e4desc" },
] as const;

const messageModes = ["praise", "nag", "custom"] as const;

const modeCardMeta: Record<AppMessageMode, { icon: string; className: string }> = {
  praise: { icon: "💜", className: "violet" },
  nag: { icon: "⚡", className: "coral" },
  custom: { icon: "✍", className: "green" },
};

type AxisOption<T extends string> = { id: T; labelKey: string; descKey?: string };

const modeAxisDefaults: Record<MessageMode, {
  messageSituation: MessageSituation;
  messageFeeling: MessageFeeling;
  messageTone: MessageTone;
  messageIntensity: MessageIntensity;
}> = {
  praise: {
    messageSituation: "study",
    messageFeeling: "tired",
    messageTone: "warm",
    messageIntensity: "firm",
  },
  nag: {
    messageSituation: "study",
    messageFeeling: "procrastinating",
    messageTone: "calm",
    messageIntensity: "firm",
  },
};

const axisOptionsByMode: Record<MessageMode, {
  situation: Array<AxisOption<MessageSituation>>;
  feeling: Array<AxisOption<MessageFeeling>>;
  tone: Array<AxisOption<MessageTone>>;
  intensity: Array<AxisOption<MessageIntensity>>;
}> = {
  praise: {
    situation: [
      { id: "study", labelKey: "axis.praise.situation.study", descKey: "axis.praise.situation.studyDesc" },
      { id: "work", labelKey: "axis.praise.situation.work", descKey: "axis.praise.situation.workDesc" },
      { id: "exercise", labelKey: "axis.praise.situation.exercise", descKey: "axis.praise.situation.exerciseDesc" },
      { id: "chores", labelKey: "axis.praise.situation.chores", descKey: "axis.praise.situation.choresDesc" },
      { id: "sleep", labelKey: "axis.praise.situation.sleep", descKey: "axis.praise.situation.sleepDesc" },
      { id: "phone", labelKey: "axis.praise.situation.phone", descKey: "axis.praise.situation.phoneDesc" },
    ],
    feeling: [
      { id: "tired", labelKey: "axis.praise.feeling.tired" },
      { id: "procrastinating", labelKey: "axis.praise.feeling.procrastinating" },
      { id: "anxious", labelKey: "axis.praise.feeling.anxious" },
      { id: "proud", labelKey: "axis.praise.feeling.proud" },
      { id: "overwhelmed", labelKey: "axis.praise.feeling.overwhelmed" },
      { id: "stuck", labelKey: "axis.praise.feeling.stuck" },
    ],
    tone: [
      { id: "warm", labelKey: "axis.praise.tone.warm" },
      { id: "calm", labelKey: "axis.praise.tone.calm" },
      { id: "practical", labelKey: "axis.praise.tone.practical" },
      { id: "short", labelKey: "axis.praise.tone.short" },
      { id: "direct", labelKey: "axis.praise.tone.direct" },
      { id: "witty", labelKey: "axis.praise.tone.witty" },
    ],
    intensity: [
      { id: "gentle", labelKey: "axis.praise.intensity.gentle" },
      { id: "firm", labelKey: "axis.praise.intensity.firm" },
      { id: "bold", labelKey: "axis.praise.intensity.bold" },
    ],
  },
  nag: {
    situation: [
      { id: "study", labelKey: "axis.nag.situation.study", descKey: "axis.nag.situation.studyDesc" },
      { id: "work", labelKey: "axis.nag.situation.work", descKey: "axis.nag.situation.workDesc" },
      { id: "exercise", labelKey: "axis.nag.situation.exercise", descKey: "axis.nag.situation.exerciseDesc" },
      { id: "chores", labelKey: "axis.nag.situation.chores", descKey: "axis.nag.situation.choresDesc" },
      { id: "sleep", labelKey: "axis.nag.situation.sleep", descKey: "axis.nag.situation.sleepDesc" },
      { id: "phone", labelKey: "axis.nag.situation.phone", descKey: "axis.nag.situation.phoneDesc" },
    ],
    feeling: [
      { id: "tired", labelKey: "axis.nag.feeling.tired" },
      { id: "procrastinating", labelKey: "axis.nag.feeling.procrastinating" },
      { id: "anxious", labelKey: "axis.nag.feeling.anxious" },
      { id: "proud", labelKey: "axis.nag.feeling.proud" },
      { id: "overwhelmed", labelKey: "axis.nag.feeling.overwhelmed" },
      { id: "stuck", labelKey: "axis.nag.feeling.stuck" },
    ],
    tone: [
      { id: "warm", labelKey: "axis.nag.tone.warm" },
      { id: "calm", labelKey: "axis.nag.tone.calm" },
      { id: "practical", labelKey: "axis.nag.tone.practical" },
      { id: "short", labelKey: "axis.nag.tone.short" },
      { id: "direct", labelKey: "axis.nag.tone.direct" },
      { id: "witty", labelKey: "axis.nag.tone.witty" },
    ],
    intensity: [
      { id: "gentle", labelKey: "axis.nag.intensity.gentle" },
      { id: "firm", labelKey: "axis.nag.intensity.firm" },
      { id: "bold", labelKey: "axis.nag.intensity.bold" },
    ],
  },
};

const axisLabels: Record<AxisKey, string> = {
  situation: "axis.situation",
  feeling: "axis.feeling",
  tone: "axis.tone",
  intensity: "axis.intensity",
};

const candidateVariantKeys: Record<ExpressionVariant, string> = {
  short_sentence: "candidate.variant.short",
  action_suggestion: "candidate.variant.action",
  ack_then_act: "candidate.variant.ack",
  notification_short: "candidate.variant.notification",
  firmer_line: "candidate.variant.firm",
};

function getSelectedAxisLabelKey<T extends string>(options: Array<AxisOption<T>>, selectedId: T): string {
  return options.find((option) => option.id === selectedId)?.labelKey ?? options[0]?.labelKey ?? "";
}

const weekDayKeys = ["weekly.sun", "weekly.mon", "weekly.tue", "weekly.wed", "weekly.thu", "weekly.fri", "weekly.sat"] as const;
const defaultScheduleTime = "21:30";
const privacyPolicyUrl = `${import.meta.env.BASE_URL}privacy.html`;
const quickTimeOptions = [
  { id: "morning", time: "08:00", labelKey: "schedule.quick.morning" },
  { id: "lunch", time: "12:30", labelKey: "schedule.quick.lunch" },
  { id: "evening", time: "21:30", labelKey: "schedule.quick.evening" },
  { id: "bed", time: "23:00", labelKey: "schedule.quick.bed" },
] as const;

type TimePickerState = {
  open: boolean;
  mode: "add" | "edit";
  index: number | null;
  draftTime: string;
};

function getTodayIndex(): number {
  return new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
}

function getWeekCareArray(existing: number[]): number[] {
  const today = getTodayIndex();
  if (existing.length === 7 && existing[today] === 1) return existing;
  const arr = existing.length === 7 ? [...existing] : [0,0,0,0,0,0,0];
  arr[today] = 1;
  return arr;
}

function countWeekCare(arr: number[]): number {
  return arr.filter(v => v === 1).length;
}

function getNextScheduledAt(time: string): number {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const now = new Date();
  const target = new Date(now);
  target.setHours(Number.isFinite(hour) ? hour : 21, Number.isFinite(minute) ? minute : 30, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime();
}

function isValidTime(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeScheduleTimes(times: string[] | undefined, fallback?: string): string[] {
  const candidates = [...(times ?? []), fallback ?? ""];
  const unique = candidates.filter(isValidTime).filter((time, index, list) => list.indexOf(time) === index);
  return unique.length > 0 ? unique : [defaultScheduleTime];
}

function getStateScheduleTimes(state: Pick<AppState, "scheduleTimes" | "scheduleTime">): string[] {
  return normalizeScheduleTimes(state.scheduleTimes, state.scheduleTime);
}

function parseTimeParts(time: string): { hour: number; minute: number } {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  return {
    hour: Number.isFinite(hour) ? Math.max(0, Math.min(23, hour)) : 21,
    minute: Number.isFinite(minute) ? Math.max(0, Math.min(59, minute)) : 30,
  };
}

function toTimeString(hour: number, minute: number): string {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const normalizedMinute = ((minute % 60) + 60) % 60;
  return `${String(normalizedHour).padStart(2, "0")}:${String(normalizedMinute).padStart(2, "0")}`;
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const { hour, minute } = parseTimeParts(time);
  const dayMinutes = 24 * 60;
  const nextTotal = (((hour * 60 + minute + minutesToAdd) % dayMinutes) + dayMinutes) % dayMinutes;
  return toTimeString(Math.floor(nextTotal / 60), nextTotal % 60);
}

function setTimePeriod(time: string, period: "am" | "pm"): string {
  const { hour, minute } = parseTimeParts(time);
  const hour12 = hour % 12;
  return toTimeString(period === "am" ? hour12 : hour12 + 12, minute);
}

function formatTimeLabel(time: string, locale: Locale): string {
  const { hour, minute } = parseTimeParts(time);
  const displayMinute = String(minute).padStart(2, "0");
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  if (locale === "ko") {
    return `${hour < 12 ? "오전" : "오후"} ${String(hour12).padStart(2, "0")}:${displayMinute}`;
  }
  return `${hour12}:${displayMinute} ${hour < 12 ? "AM" : "PM"}`;
}

function formatScheduleSummary(times: string[], locale: Locale): string {
  const normalized = normalizeScheduleTimes(times);
  const labels = normalized.map((time) => formatTimeLabel(time, locale));
  if (labels.length <= 2) return labels.join(locale === "ko" ? ", " : ", ");
  return locale === "ko" ? `${labels[0]} 외 ${labels.length - 1}개` : `${labels[0]} +${labels.length - 1} more`;
}

function createPersistedState(state: AppState): AppState {
  return {
    ...state,
    generationContext: "",
    generatedCandidates: [],
    selectedCandidateId: null,
    reportedCandidateIds: [],
    generationStatus: state.generationStatus === "loading" ? "idle" : state.generationStatus,
  };
}

export default function App() {
  const platformAdapters = useMemo(() => createMvpPlatformAdapters(), []);
  const messageGeneration = useMemo(() => createMessageGenerationAdapter(), []);
  const candidateReporting = useMemo(() => createCandidateReportAdapter(), []);
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = platformAdapters.storage.loadLocale();
    return isLocale(stored) ? stored : "ko";
  });
  const i18n = useMemo(() => createI18n(locale), [locale]);

  const createDefaultState = (): AppState => ({
    sourceTag: "channel-direct",
    step: 1,
    targetConfirmed: false,
    messageMode: "praise",
    ...modeAxisDefaults.praise,
    generationContext: "",
    generationStatus: "idle",
    generatedCandidates: [],
    selectedCandidateId: null,
    aiDisclosureSeen: false,
    reportedCandidateIds: [],
    selectedPraiseId: null,
    selectedPraise: "",
    selectedNotificationText: "",
    selectedEmotion: null,
    rewriteText: "",
    scheduleTime: defaultScheduleTime,
    scheduleTimes: [defaultScheduleTime],
    previewText: "",
    notificationStatus: "idle",
    notificationMessage: "",
    checkinAction: null,
    reopenSource: "manual",
    safetyState: "safe",
    interestAction: null,
    sessionPhase: "initial",
    savedAt: null,
    vaultItems: [],
    weeklyCare: [],
    navTab: "home",
  });

  const normalizeStoredState = (saved: string | null): AppState => {
    if (!saved) return createDefaultState();
    try {
      const parsed = JSON.parse(saved) as Partial<AppState> | null;
      if (!parsed) return createDefaultState();
      const parsedState = parsed as Partial<AppState>;

      if (parsedState.sessionPhase === "reopened") {
        const reopenedStep = typeof parsedState.step === "number" ? parsedState.step : 5;
        return {
          ...createDefaultState(),
          ...parsedState,
          step: reopenedStep >= 5 ? 5 : 5,
          scheduleTime: getStateScheduleTimes({ ...createDefaultState(), ...parsedState })[0] ?? defaultScheduleTime,
          scheduleTimes: getStateScheduleTimes({ ...createDefaultState(), ...parsedState }),
          reopenSource: parsedState.reopenSource === "manual" || parsedState.reopenSource === "notification"
            ? parsedState.reopenSource : "unknown",
        };
      }
      const mergedState = { ...createDefaultState(), ...parsedState };
      const scheduleTimes = getStateScheduleTimes(mergedState);
      return { ...mergedState, scheduleTime: scheduleTimes[0] ?? defaultScheduleTime, scheduleTimes };
    } catch {
      return createDefaultState();
    }
  };

  const [state, setState] = useState<AppState>(() => {
    const saved = platformAdapters.storage.getItem("state");
    return normalizeStoredState(saved);
  });
  const safetyEventRef = useRef<{ safety: AppState["safetyState"]; text: string }>({ safety: "safe", text: "" });
  const checkinEventRef = useRef<{ step: Step; phase: AppState["sessionPhase"] }>({ step: 1, phase: "initial" });
  const resultViewRef = useRef<Step>(1);

  const [revealed, setRevealed] = useState(false);
  const [timePickerState, setTimePickerState] = useState<TimePickerState>({
    open: false,
    mode: "add",
    index: null,
    draftTime: defaultScheduleTime,
  });
  const [axisSheetKey, setAxisSheetKey] = useState<AxisKey | null>(null);
  const axisSheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    platformAdapters.storage.saveLocale(locale);
  }, [locale, platformAdapters.storage]);

  useEffect(() => {
    platformAdapters.storage.setItem("state", JSON.stringify(createPersistedState(state)));
  }, [state, platformAdapters.storage]);

  useEffect(() => {
    if (!axisSheetKey || typeof document === "undefined") return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])";
    const focusFirst = () => {
      const firstFocusable = axisSheetRef.current?.querySelector<HTMLElement>(focusableSelector);
      firstFocusable?.focus();
    };
    focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAxisSheetKey(null);
        return;
      }
      if (event.key !== "Tab" || !axisSheetRef.current) return;
      const focusable = Array.from(axisSheetRef.current.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [axisSheetKey]);

  const announce = (eventName: string, properties: Record<string, unknown>) => {
    void platformAdapters.analytics.track(eventName, sanitizeAnalytics({ event: eventName, ...properties }));
  };

  useEffect(() => {
    announce("landing_viewed", { source: state.sourceTag, locale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPreview = state.previewText || i18n.t("preview.fallback");
  const pendingLineText = (state.selectedPraise || state.rewriteText).trim();
  const hasPendingLine = Boolean(pendingLineText && pendingLineText !== state.previewText.trim());
  const schedulePreviewText = pendingLineText || state.previewText;
  const scheduleTimes = getStateScheduleTimes(state);
  const scheduleSummary = formatScheduleSummary(scheduleTimes, locale);
  const rewriteMessage: { message: string; safety: "safe" | "caution" | "blocked" } = (() => {
    const text = state.rewriteText.trim();
    if (!text) return { message: "", safety: "safe" as const };
    const safety = classifyMessageSafety(text);
    if (safety.level === "blocked") return { message: i18n.t("rewrite.blocked"), safety: "blocked" as const };
    if (safety.level === "caution") return { message: i18n.t("rewrite.caution"), safety: "caution" as const };
    return { message: "", safety: "safe" as const };
  })();
  const directMessage = (() => {
    const text = state.generationContext.trim();
    if (!text) return { message: "", safety: "safe" as const };
    const safety = classifyMessageSafety(text);
    if (safety.level === "blocked") return { message: i18n.t("rewrite.blocked"), safety: "blocked" as const };
    if (safety.level === "caution") return { message: i18n.t("rewrite.caution"), safety: "caution" as const };
    return { message: "", safety: "safe" as const };
  })();
  const activeMessageMode = state.messageMode === "nag" ? "nag" : "praise";
  const activeAxisOptions = axisOptionsByMode[activeMessageMode];
  const axisGroups = state.messageMode === "custom" ? [] : ([
    {
      key: "situation" as const,
      labelKey: axisLabels.situation,
      selectedId: state.messageSituation,
      selectedLabelKey: getSelectedAxisLabelKey(activeAxisOptions.situation, state.messageSituation),
      options: activeAxisOptions.situation,
    },
    {
      key: "feeling" as const,
      labelKey: axisLabels.feeling,
      selectedId: state.messageFeeling,
      selectedLabelKey: getSelectedAxisLabelKey(activeAxisOptions.feeling, state.messageFeeling),
      options: activeAxisOptions.feeling,
    },
    {
      key: "tone" as const,
      labelKey: axisLabels.tone,
      selectedId: state.messageTone,
      selectedLabelKey: getSelectedAxisLabelKey(activeAxisOptions.tone, state.messageTone),
      options: activeAxisOptions.tone,
    },
    {
      key: "intensity" as const,
      labelKey: axisLabels.intensity,
      selectedId: state.messageIntensity,
      selectedLabelKey: getSelectedAxisLabelKey(activeAxisOptions.intensity, state.messageIntensity),
      options: activeAxisOptions.intensity,
    },
  ]);
  const activeAxisGroup = axisGroups.find((group) => group.key === axisSheetKey);

  const chooseAxisValue = (key: AxisKey, id: MessageSituation | MessageFeeling | MessageTone | MessageIntensity) => {
    setState((current) => {
      if (key === "situation") return { ...current, messageSituation: id as MessageSituation };
      if (key === "feeling") return { ...current, messageFeeling: id as MessageFeeling };
      if (key === "tone") return { ...current, messageTone: id as MessageTone };
      return { ...current, messageIntensity: id as MessageIntensity };
    });
    setAxisSheetKey(null);
  };

  useEffect(() => {
    if (rewriteMessage.safety === "blocked" && (safetyEventRef.current.safety !== "blocked" || safetyEventRef.current.text !== state.rewriteText)) {
      safetyEventRef.current = { safety: "blocked", text: state.rewriteText };
      announce("message_blocked", { source: state.sourceTag, choice: "rewrite" });
      return;
    }
    if (rewriteMessage.safety === "caution" && (safetyEventRef.current.safety !== "caution" || safetyEventRef.current.text !== state.rewriteText)) {
      safetyEventRef.current = { safety: "caution", text: state.rewriteText };
      announce("message_cautioned", { source: state.sourceTag, choice: "rewrite" });
    }
    if (rewriteMessage.safety === "safe") {
      safetyEventRef.current = { safety: "safe", text: state.rewriteText };
    }
  }, [announce, rewriteMessage.safety, state.rewriteText, state.sourceTag]);

  useEffect(() => {
    if (state.step === 6 && state.sessionPhase === "reopened" && resultViewRef.current !== 6) {
      announce("vault_interest_viewed", { source: state.reopenSource, sourceTag: state.sourceTag });
    }
    if (state.step === 3 && checkinEventRef.current.step !== 3) {
      announce("rewrite_started", { source: state.sourceTag });
    }
    if (state.step === 5 && state.sessionPhase === "reopened" && (checkinEventRef.current.step !== 5 || checkinEventRef.current.phase !== state.sessionPhase)) {
      announce("return_next_day", { source: state.reopenSource, sourceTag: state.sourceTag });
      if (state.reopenSource === "manual") {
        announce("return_next_day_manual", { source: state.reopenSource, sourceTag: state.sourceTag });
      }
      announce("checkin_prompt_viewed", { source: state.reopenSource, sourceTag: state.sourceTag });
    }
    checkinEventRef.current = { step: state.step, phase: state.sessionPhase };
    resultViewRef.current = state.step;
  }, [announce, state.reopenSource, state.sessionPhase, state.sourceTag, state.step]);

  const selectPraise = (id: string) => {
    const selected = allPraiseOptions.find((item) => item.id === id)!;
    const text = locale === "ko" ? selected.ko : selected.en;
    setState((current) => ({ ...current, selectedPraiseId: id, selectedPraise: text, rewriteText: text }));
    announce("praise_selected", { id, text });
  };

  const generateCandidates = async () => {
    if (state.messageMode === "custom") return;
    const context = state.generationContext.trim();
    setState((current) => ({
      ...current,
      aiDisclosureSeen: true,
      generationStatus: "loading",
      generatedCandidates: [],
      selectedCandidateId: null,
      selectedPraise: "",
      selectedNotificationText: "",
      rewriteText: "",
    }));
    announce("ai_generation_requested", { source: state.sourceTag, choice: state.messageMode });
    const result = await messageGeneration.generate({
      mode: state.messageMode,
      context,
      locale,
      situation: state.messageSituation,
      feeling: state.messageFeeling,
      tone: state.messageTone,
      intensity: state.messageIntensity,
      purpose: state.messageMode === "praise" ? "recognize" : "start",
    });
    if (result.decision === "blocked") {
      const isUnavailable = result.reasonCode ? aiUnavailableReasonCodes.has(result.reasonCode) : false;
      setState((current) => ({
        ...current,
        generationStatus: isUnavailable ? "error" : "blocked",
        generatedCandidates: [],
      }));
      announce(isUnavailable ? "ai_generation_unavailable" : "ai_generation_blocked", { source: state.sourceTag, choice: state.messageMode, status: result.reasonCode ?? "blocked" });
      return;
    }
    if (result.source !== "ai" || result.candidates.length === 0) {
      setState((current) => ({
        ...current,
        generationStatus: "error",
        generatedCandidates: [],
      }));
      announce("ai_generation_unavailable", { source: state.sourceTag, choice: state.messageMode, status: result.reasonCode ?? result.source });
      return;
    }
    setState((current) => ({
      ...current,
      generationStatus: "success",
      generatedCandidates: result.candidates,
      aiDisclosureSeen: true,
    }));
    announce("ai_candidates_generated", { source: state.sourceTag, choice: state.messageMode, status: result.source });
  };

  const commitDirectMessage = () => {
    const text = state.generationContext.trim();
    if (!text || directMessage.safety === "blocked") return;
    setState((current) => ({
      ...current,
      selectedCandidateId: null,
      selectedPraiseId: "custom",
      selectedPraise: text,
      selectedNotificationText: text.length > 32 ? `${text.slice(0, 32)}...` : text,
      rewriteText: text,
      safetyState: directMessage.safety,
      generatedCandidates: [],
      generationStatus: "idle",
      step: 4,
    }));
    announce("direct_message_saved", { source: state.sourceTag, choice: "custom", status: directMessage.safety });
  };

  const selectCandidate = (candidate: MessageCandidate) => {
    setState((current) => ({
      ...current,
      selectedCandidateId: candidate.id,
      selectedPraiseId: candidate.id,
      selectedPraise: candidate.text,
      selectedNotificationText: candidate.notificationText,
      rewriteText: candidate.text,
    }));
    announce("ai_candidate_selected", { source: state.sourceTag, choice: candidate.mode, variant: candidate.expressionVariant });
  };

  const openTimePicker = (index: number | null) => {
    const currentTimes = getStateScheduleTimes(state);
    setTimePickerState({
      open: true,
      mode: index === null ? "add" : "edit",
      index,
      draftTime: index === null ? currentTimes[currentTimes.length - 1] ?? defaultScheduleTime : currentTimes[index] ?? defaultScheduleTime,
    });
  };

  const closeTimePicker = () => {
    setTimePickerState((current) => ({ ...current, open: false }));
  };

  const commitTimePicker = () => {
    setState((current) => {
      const currentTimes = getStateScheduleTimes(current);
      const nextTimes = timePickerState.mode === "edit" && timePickerState.index !== null
        ? currentTimes.map((time, index) => (index === timePickerState.index ? timePickerState.draftTime : time))
        : [...currentTimes, timePickerState.draftTime];
      const normalizedTimes = normalizeScheduleTimes(nextTimes);
      return {
        ...current,
        scheduleTime: normalizedTimes[0] ?? defaultScheduleTime,
        scheduleTimes: normalizedTimes,
      };
    });
    closeTimePicker();
  };

  const removeScheduleTime = (indexToRemove: number) => {
    setState((current) => {
      const nextTimes = getStateScheduleTimes(current).filter((_, index) => index !== indexToRemove);
      const normalizedTimes = normalizeScheduleTimes(nextTimes);
      return {
        ...current,
        scheduleTime: normalizedTimes[0] ?? defaultScheduleTime,
        scheduleTimes: normalizedTimes,
      };
    });
  };

  const scheduleSelectedMessage = async () => {
    announce("schedule_started", { source: state.sourceTag, sourceTag: state.sourceTag });
    const now = Date.now();
    const finalText = state.selectedPraise || state.rewriteText || selectedPreview;
    const timesToSchedule = getStateScheduleTimes(state);
    if (platformAdapters.notifications.capability === "preview_only") {
      const newWeeklyCare = getWeekCareArray(state.weeklyCare);
      setState((current) => ({
        ...current,
        previewText: finalText,
        savedAt: now,
        vaultItems: current.vaultItems.some((item) => item.text === finalText)
          ? current.vaultItems
          : [...current.vaultItems, { id: `v-${now}`, text: finalText, savedAt: now }],
        step: 4,
        sessionPhase: "initial",
        weeklyCare: newWeeklyCare,
        scheduleTime: timesToSchedule[0] ?? defaultScheduleTime,
        scheduleTimes: timesToSchedule,
        notificationStatus: "preview_only",
        notificationMessage: i18n.t("notification.previewOnly"),
        generationContext: "",
        generatedCandidates: [],
        selectedCandidateId: null,
        reportedCandidateIds: [],
      }));
      announce("reminder_created", { source: state.sourceTag, timeCount: timesToSchedule.length, times: timesToSchedule.join("|"), status: "preview_only" });
      announce("preview_viewed", { source: state.sourceTag, sourceTag: state.sourceTag });
      return;
    }
    const permission = await platformAdapters.notifications.requestPermission();
    let notificationStatus: AppState["notificationStatus"] = permission === "unsupported" ? "unsupported" : permission === "denied" ? "denied" : "prompt";
    let notificationMessage = permission === "unsupported"
      ? i18n.t("notification.unsupported")
      : permission === "denied"
        ? i18n.t("notification.denied")
        : i18n.t("notification.prompt");
    if (permission === "granted") {
      let scheduledCount = 0;
      let blockedByUnsupported = false;
      for (const [index, time] of timesToSchedule.entries()) {
        const result = await platformAdapters.notifications.scheduleReminder({
          id: `message-${now}-${index}`,
          title: i18n.t("app.title"),
          body: finalText,
          scheduledAt: getNextScheduledAt(time),
        });
        if (result.status === "scheduled") {
          scheduledCount += 1;
        } else {
          blockedByUnsupported = result.reason === "unsupported";
        }
      }
      if (scheduledCount > 0) {
        notificationStatus = "scheduled";
        notificationMessage = scheduledCount === 1
          ? i18n.t("notification.scheduled")
          : i18n.t("notification.scheduledMany", { count: scheduledCount });
      } else {
        notificationStatus = "blocked";
        notificationMessage = blockedByUnsupported ? i18n.t("notification.unsupported") : i18n.t("notification.denied");
      }
    }
    const newWeeklyCare = getWeekCareArray(state.weeklyCare);
    setState((current) => ({
      ...current,
      previewText: finalText,
      savedAt: now,
      vaultItems: current.vaultItems.some((item) => item.text === finalText)
        ? current.vaultItems
        : [...current.vaultItems, { id: `v-${now}`, text: finalText, savedAt: now }],
      step: 4,
      sessionPhase: "initial",
      weeklyCare: newWeeklyCare,
      scheduleTime: timesToSchedule[0] ?? defaultScheduleTime,
      scheduleTimes: timesToSchedule,
      notificationStatus,
      notificationMessage,
      generationContext: "",
      generatedCandidates: [],
      selectedCandidateId: null,
      reportedCandidateIds: [],
    }));
    announce("reminder_created", { source: state.sourceTag, timeCount: timesToSchedule.length, times: timesToSchedule.join("|"), status: notificationStatus });
    announce("preview_viewed", { source: state.sourceTag, sourceTag: state.sourceTag });
  };

  const visiblePraiseOptions = revealed
    ? allPraiseOptions
    : allPraiseOptions.filter((item) => initialPraiseIds.includes(item.id));

  const resultSummaryText = (() => {
    if (state.checkinAction === "keep") return i18n.t("result.summaryKeep");
    if (state.checkinAction === "skip") return i18n.t("result.summarySkip");
    return i18n.t("result.summaryEdit");
  })();

  const hasActiveSession = state.savedAt !== null;
  const showAppFlow = state.navTab === "home";
  const showHome = showAppFlow && hasActiveSession && state.sessionPhase === "initial" && state.step === 4 && !hasPendingLine;
  const weekCare = state.weeklyCare.length === 7 ? state.weeklyCare : [0,0,0,0,0,0,0];
  const weekCareCount = countWeekCare(weekCare);
  const showBackButton = state.navTab !== "home" || (showAppFlow && !showHome && state.step > 1);
  const showBottomNav = hasActiveSession || state.navTab !== "home" || state.step > 1;

  const handleBack = () => {
    setState((current) => {
      if (current.navTab !== "home") return { ...current, navTab: "home" };

      if (current.sessionPhase === "reopened" && current.step === 5) {
        return { ...current, sessionPhase: "initial", step: 4 };
      }

      if (current.step === 2) {
        return {
          ...current,
          step: current.savedAt ? 4 : 1,
          generatedCandidates: [],
          selectedCandidateId: null,
          generationStatus: "idle",
        };
      }

      if (current.step === 3) return { ...current, step: 2 };
      if (current.step === 4) return { ...current, step: current.messageMode === "custom" ? 2 : 3 };
      if (current.step === 6) return { ...current, step: 5 };

      return current;
    });
    announce("navigation_back", { source: state.sourceTag, step: state.step, tab: state.navTab });
  };

  return (
    <main className={`app-shell${showBackButton ? " has-top-back" : ""}${showBottomNav ? " has-bottom-nav" : ""}`} aria-label={i18n.t("app.aria")}>
      {showBackButton && (
        <button
          type="button"
          className="top-back-button"
          aria-label={i18n.t("navigation.back")}
          title={i18n.t("navigation.back")}
          onClick={handleBack}
        >
          <span aria-hidden="true">←</span>
        </button>
      )}
      <div className="app-home">
        {/* ────── Progress rail ────── */}
        {showAppFlow && !showHome && (
          <nav className="progress-rail" aria-label={i18n.t("navigation.preview")}>
            {progressLabels.map((labelKey, index) => {
              const dotStep = (index + 1) as Step;
              const isActive = state.step === dotStep;
              const isPast = state.step > dotStep;
              return (
                <div key={labelKey} className={`progress-rail-dot${isActive ? " active" : ""}${isPast ? " past" : ""}`}>
                  <span className="dot" />
                  <span className="progress-rail-label">{i18n.t(labelKey)}</span>
                </div>
              );
            })}
          </nav>
        )}

        {/* ═══════════ HOME DASHBOARD ═══════════ */}
        {showHome && (
          <section className="screen-section" style={{ gap: 32 }}>
            {/* Header */}
            <div className="home-header">
              <span className="brand-badge">{i18n.t("app.title")}</span>
              <h2 className="home-headline">{i18n.t("home.headline")}</h2>
              <p className="home-support">{i18n.t("home.support")}</p>
              {weekCareCount > 0 && (
                <span className="brand-badge" style={{ marginTop: 4 }}>
                  💜 {i18n.t("home.weeklySummary", { count: weekCareCount })}
                </span>
              )}
            </div>

            {/* Hero panel */}
            <div className="hero-panel">
              <span className="hero-label">{i18n.t("home.heroLabel")}</span>
              <p className="hero-quote">{selectedPreview}</p>
              <p className="hero-sub">{i18n.t("home.heroLine", { time: scheduleSummary })}</p>
              {state.notificationMessage && (
                <p className={`hero-notice ${state.notificationStatus === "scheduled" ? "safe" : "caution"}`}>
                  {state.notificationMessage}
                </p>
              )}
              <button
                type="button"
                className="hero-pill"
                onClick={() => setState((current) => ({ ...current, step: 2, revealed: false }))}
              >
                {i18n.t("home.heroChange")}
              </button>
            </div>

            {/* Emotion grid */}
            <div>
              <div className="section-label" style={{ marginBottom: 14 }}>
                <h3>{i18n.t("home.emotionTitle")}</h3>
              </div>
              <p className="screen-body" style={{ marginBottom: 14 }}>{i18n.t("home.emotionCaption")}</p>
              <div className="emotion-grid">
                {emotionChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={`emotion-chip ${chip.color}`}
                    onClick={() => {
                      setState((current) => ({
                        ...current,
                        selectedEmotion: chip.id,
                        step: 2,
                        revealed: false,
                      }));
                      announce("praise_selected", { id: chip.id, text: i18n.t(chip.i18nKey) });
                    }}
                  >
                    <span className="chip-icon" aria-hidden="true">{chip.icon}</span>
                    <span className="chip-title">{i18n.t(chip.i18nKey)}</span>
                    <span className="chip-desc">{i18n.t(chip.descKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly care panel */}
            <div className="weekly-panel">
              <p className="weekly-title">{i18n.t("home.weeklyTitle")}</p>
              <p className="weekly-summary">{i18n.t("home.weeklySummary", { count: weekCareCount })}</p>
              <div className="weekly-dots">
                {weekDayKeys.map((key, idx) => (
                  <div key={key} className="weekly-dot">
                    <div className={`dot-circle${weekCare[idx] === 1 ? " filled" : ""}`}>
                      {weekCare[idx] === 1 ? "✓" : ""}
                    </div>
                    <span>{i18n.t(key)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              className="pm-primary-cta"
              onClick={() => setState((current) => ({ ...current, step: 2, revealed: false }))}
            >
              {i18n.t("home.pickCta")}
            </button>
          </section>
        )}

        {/* ═══════════ SCREEN 1: Landing ═══════════ */}
	        {showAppFlow && state.step === 1 && (
          <section className="screen-section">
            <div className="language-switcher" aria-label={i18n.t("settings.language")}>
              {localeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`lang-option${locale === option.id ? " is-selected" : ""}`}
                  aria-pressed={locale === option.id}
                  onClick={() => setLocale(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <header className="hero" style={{ paddingTop: 0 }}>
              <h1>{i18n.t("app.title")}</h1>
              <h2 className="screen-title">{i18n.t("landing.title")}</h2>
              <p className="subtitle">{i18n.t("landing.body")}</p>
            </header>

            <button
              type="button"
              className="pm-primary-cta"
              onClick={() => { setState((current) => ({ ...current, targetConfirmed: true, step: 2 })); announce("target_confirmed", { source: state.sourceTag }); }}
            >
              {i18n.t("landing.confirm")}
            </button>
            <button
              type="button"
              className="pm-secondary-cta"
              onClick={() => announce("target_rejected", { source: state.sourceTag })}
            >
              {i18n.t("landing.reject")}
            </button>
          </section>
        )}

        {/* ═══════════ SCREEN 2: AI Candidate Generation ═══════════ */}
	        {showAppFlow && state.step === 2 && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("ai.title")}</h2>
            <p className="screen-body">{i18n.t("ai.body")}</p>

            <div className="button-stack">
              {messageModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`pm-choice-card ${modeCardMeta[mode].className}`}
                  aria-label={i18n.t(`mode.${mode}`)}
                  aria-pressed={state.messageMode === mode}
                  onClick={() => {
                    setAxisSheetKey(null);
                    setState((current) => ({
                      ...current,
                      ...(mode === "custom" ? {} : modeAxisDefaults[mode]),
                      messageMode: mode,
                      generatedCandidates: [],
                      selectedCandidateId: null,
                      selectedPraise: "",
                      selectedNotificationText: "",
                      rewriteText: "",
                      generationStatus: "idle",
                    }));
                  }}
                >
                  <span className="choice-card-icon" aria-hidden="true">{modeCardMeta[mode].icon}</span>
                  <span className="choice-card-body">
                    <span className="choice-card-title">{i18n.t(`mode.${mode}`)}</span>
                    <span className="choice-card-sub">{i18n.t(`mode.${mode}Sub`)}</span>
                  </span>
                  <span className="choice-card-check" aria-hidden="true">{state.messageMode === mode ? "✓" : ""}</span>
                </button>
              ))}
            </div>

            {state.messageMode !== "custom" && (
              <div className="axis-panel" aria-label={i18n.t("axis.title")}>
                {axisGroups.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    className="axis-summary-button"
                    onClick={() => setAxisSheetKey(group.key)}
                  >
                    <span className="axis-summary-label">{i18n.t(group.labelKey)}</span>
                    <span className="axis-summary-value">{i18n.t(group.selectedLabelKey)}</span>
                  </button>
                ))}
              </div>
            )}

            {activeAxisGroup && (
              <div className="axis-sheet-backdrop" onClick={() => setAxisSheetKey(null)}>
                <div
                  ref={axisSheetRef}
                  className="axis-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label={i18n.t("axis.dialogTitle", { axis: i18n.t(activeAxisGroup.labelKey) })}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="axis-sheet-head">
                    <h3>{i18n.t("axis.dialogTitle", { axis: i18n.t(activeAxisGroup.labelKey) })}</h3>
                    <button type="button" className="axis-sheet-close" aria-label={i18n.t("axis.close")} onClick={() => setAxisSheetKey(null)}>×</button>
                  </div>
                  <div className="axis-option-grid">
                    {activeAxisGroup.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-label={i18n.t(option.labelKey)}
                        className={`axis-option-card${activeAxisGroup.selectedId === option.id ? " is-selected" : ""}`}
                        aria-pressed={activeAxisGroup.selectedId === option.id}
                        onClick={() => chooseAxisValue(activeAxisGroup.key, option.id)}
                      >
                        <span>{i18n.t(option.labelKey)}</span>
                        {option.descKey && <small>{i18n.t(option.descKey)}</small>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="textarea-card">
              <textarea
                aria-label={state.messageMode === "custom" ? i18n.t("custom.inputLabel") : i18n.t("ai.inputLabel")}
                value={state.generationContext}
                onChange={(event) => setState((current) => ({ ...current, generationContext: event.target.value.slice(0, 120) }))}
                placeholder={state.messageMode === "custom"
                  ? i18n.t("custom.placeholder")
                  : state.messageMode === "praise" ? i18n.t("ai.praisePlaceholder") : i18n.t("ai.nagPlaceholder")}
              />
              <span className="textarea-helper">
                {state.messageMode === "custom" ? i18n.t("custom.helper", { count: state.generationContext.length }) : i18n.t("ai.inputHelper", { count: state.generationContext.length })}
              </span>
            </div>

            {state.messageMode !== "custom" && (
              <div className="settings-card">
                <span className="preview-badge">{i18n.t("ai.disclosureBadge")}</span>
                <p className="settings-note">{i18n.t("ai.disclosure")}</p>
                <p className="settings-note">{i18n.t("privacy.localNotice")}</p>
              </div>
            )}

            {state.messageMode === "custom" && (
              <div className="settings-card">
                <span className="preview-badge">{i18n.t("custom.badge")}</span>
                <p className="settings-note">{i18n.t("custom.body")}</p>
                <p className="settings-note">{i18n.t("privacy.localNotice")}</p>
              </div>
            )}

            {state.generationStatus === "blocked" && (
              <p className="safety-message blocked">{i18n.t("ai.blocked")}</p>
            )}

            {state.generationStatus === "error" && (
              <p className="safety-message caution">{i18n.t("ai.unavailable")}</p>
            )}

            {state.messageMode === "custom" && directMessage.message && (
              <p className={`safety-message ${directMessage.safety}`}>{directMessage.message}</p>
            )}

            {state.messageMode === "custom" ? (
              <button
                type="button"
                className="pm-primary-cta"
                disabled={!state.generationContext.trim() || directMessage.safety === "blocked"}
                onClick={commitDirectMessage}
              >
                {i18n.t("custom.continue")}
              </button>
            ) : (
              <button
                type="button"
                className="pm-primary-cta"
                disabled={state.generationStatus === "loading"}
                onClick={generateCandidates}
              >
                {state.generationStatus === "loading" ? i18n.t("ai.generating") : i18n.t("ai.generate")}
              </button>
            )}

            {state.generatedCandidates.length > 0 && (
              <div className="button-stack">
                {state.generatedCandidates.map((candidate) => (
                  <div key={candidate.id} className={`candidate-card ${candidate.expressionVariant}`}>
                    <span className="preview-badge">
                      {candidate.source === "ai" ? i18n.t("ai.candidateLabel") : i18n.t("ai.fallbackLabel")}
                    </span>
                    <span className="candidate-variant">{i18n.t(candidateVariantKeys[candidate.expressionVariant])}</span>
                    <button
                      type="button"
                      className="candidate-select"
                      aria-pressed={state.selectedCandidateId === candidate.id}
                      onClick={() => selectCandidate(candidate)}
                    >
                      {candidate.text}
                    </button>
                    <button
                      type="button"
                      className="pm-text-action"
                      onClick={() => {
                        setState((current) => ({ ...current, reportedCandidateIds: [...new Set([...current.reportedCandidateIds, candidate.id])] }));
                        announce("ai_candidate_reported", { source: state.sourceTag, choice: candidate.mode, variant: candidate.expressionVariant });
                        void candidateReporting.report({
                          candidateId: candidate.id,
                          mode: candidate.mode,
                          expressionVariant: candidate.expressionVariant,
                          source: candidate.source,
                          locale,
                          surface: "candidate_card",
                          reasonCode: "uncomfortable",
                        });
                      }}
                    >
                      {i18n.t("ai.report")}
                    </button>
                    {state.reportedCandidateIds.includes(candidate.id) && (
                      <p className="settings-note">{i18n.t("ai.reported")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {state.messageMode !== "custom" && (
              <button
                type="button"
                className="pm-primary-cta"
                disabled={!state.selectedCandidateId}
                onClick={() => { setState((current) => ({ ...current, step: 3 })); }}
              >
                {i18n.t("ai.continue")}
              </button>
            )}
          </section>
        )}

        {/* ═══════════ SCREEN 3: Rewrite Optional ═══════════ */}
	        {showAppFlow && state.step === 3 && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("rewrite.title")}</h2>
            <p className="screen-body">{i18n.t("rewrite.body")}</p>

            <div className="quote-card">
              <p className="quote-text">{state.selectedPraise}</p>
            </div>

            <div className="textarea-card">
              <textarea
                aria-label={i18n.t("rewrite.placeholder")}
                value={state.rewriteText}
                onChange={(event) => setState((current) => ({ ...current, rewriteText: event.target.value }))}
                placeholder={i18n.t("rewrite.placeholder")}
              />
              <span className="textarea-helper">{i18n.t("rewrite.body")}</span>
            </div>

            {rewriteMessage.message && (
              <p className={`safety-message ${rewriteMessage.safety}`}>{rewriteMessage.message}</p>
            )}

            <button
              type="button"
              className="pm-primary-cta"
              disabled={rewriteMessage.safety === "blocked"}
              onClick={() => {
                setState((current) => ({
                  ...current,
                  selectedPraise: current.rewriteText.trim() || current.selectedPraise,
                  safetyState: rewriteMessage.safety,
                  step: 4,
                }));
                if (rewriteMessage.safety === "caution") {
                  announce("message_cautioned", { source: state.sourceTag, choice: "rewrite" });
                }
                announce("rewrite_saved", { source: state.sourceTag, choice: "rewrite" });
              }}
            >
              {i18n.t("rewrite.save")}
            </button>
            <button
              type="button"
              className="pm-secondary-cta"
              onClick={() => {
                setState((current) => ({ ...current, step: 4 }));
                announce("rewrite_saved", { source: state.sourceTag, choice: "original" });
              }}
            >
              {i18n.t("rewrite.keepOriginal")}
            </button>
          </section>
        )}

        {/* ═══════════ SCREEN 4: Time Save + Preview ═══════════ */}
	        {showAppFlow && state.step === 4 && !showHome && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("schedule.title")}</h2>
            <p className="screen-body">{i18n.t("schedule.body")}</p>

            <div className="time-picker-card">
              <div className="time-picker-header">
                <span>{i18n.t("schedule.label")}</span>
                <button
                  type="button"
                  className="pm-text-action time-add-button"
                  onClick={() => openTimePicker(null)}
                >
                  {i18n.t("schedule.addTime")}
                </button>
              </div>

              <div className="time-list" aria-label={i18n.t("schedule.savedTimes")}>
                {scheduleTimes.map((time, index) => (
                  <div key={`${time}-${index}`} className="time-row">
                    <button
                      type="button"
                      className="time-row-main"
                      aria-label={i18n.t("schedule.editTimeLabel", { time: formatTimeLabel(time, locale) })}
                      onClick={() => openTimePicker(index)}
                    >
                      <span>{i18n.t("schedule.timeItem", { index: index + 1 })}</span>
                      <strong>{formatTimeLabel(time, locale)}</strong>
                    </button>
                    {scheduleTimes.length > 1 && (
                      <button
                        type="button"
                        className="pm-text-action time-remove-button"
                        aria-label={i18n.t("schedule.removeTimeLabel", { time: formatTimeLabel(time, locale) })}
                        onClick={() => removeScheduleTime(index)}
                      >
                        {i18n.t("schedule.removeTime")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {timePickerState.open && (
              <div className="time-sheet-backdrop">
                <section
                  className="time-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label={i18n.t(timePickerState.mode === "add" ? "schedule.addDialogTitle" : "schedule.editDialogTitle")}
                >
                  <div className="time-sheet-header">
                    <h3>{i18n.t(timePickerState.mode === "add" ? "schedule.addDialogTitle" : "schedule.editDialogTitle")}</h3>
                    <button type="button" className="pm-text-action" onClick={closeTimePicker}>
                      {i18n.t("schedule.cancelPicker")}
                    </button>
                  </div>
                  <p className="time-sheet-hint">{i18n.t("schedule.pickerHint")}</p>

                  <div className="quick-time-grid">
                    {quickTimeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`pm-secondary-cta quick-time-chip${timePickerState.draftTime === option.time ? " is-selected" : ""}`}
                        aria-pressed={timePickerState.draftTime === option.time}
                        onClick={() => setTimePickerState((current) => ({ ...current, draftTime: option.time }))}
                      >
                        {i18n.t(option.labelKey)}
                      </button>
                    ))}
                  </div>

                  <div className="time-adjuster">
                    <p className="time-preview">{formatTimeLabel(timePickerState.draftTime, locale)}</p>
                    <div className="ampm-toggle" aria-label={i18n.t("schedule.ampmLabel")}>
                      {(["am", "pm"] as const).map((period) => {
                        const isSelected = (parseTimeParts(timePickerState.draftTime).hour < 12 ? "am" : "pm") === period;
                        return (
                          <button
                            key={period}
                            type="button"
                            className="pm-text-action"
                            aria-pressed={isSelected}
                            onClick={() => setTimePickerState((current) => ({ ...current, draftTime: setTimePeriod(current.draftTime, period) }))}
                          >
                            {i18n.t(`schedule.ampm.${period}`)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="time-adjuster-grid">
                      <div className="time-adjust-column">
                        <button
                          type="button"
                          className="pm-secondary-cta time-adjust-button"
                          aria-label={i18n.t("schedule.hourUp")}
                          onClick={() => setTimePickerState((current) => ({ ...current, draftTime: addMinutesToTime(current.draftTime, 60) }))}
                        >
                          +
                        </button>
                        <span>{i18n.t("schedule.hourUnit")}</span>
                        <button
                          type="button"
                          className="pm-secondary-cta time-adjust-button"
                          aria-label={i18n.t("schedule.hourDown")}
                          onClick={() => setTimePickerState((current) => ({ ...current, draftTime: addMinutesToTime(current.draftTime, -60) }))}
                        >
                          -
                        </button>
                      </div>
                      <div className="time-adjust-column">
                        <button
                          type="button"
                          className="pm-secondary-cta time-adjust-button"
                          aria-label={i18n.t("schedule.minuteUp")}
                          onClick={() => setTimePickerState((current) => ({ ...current, draftTime: addMinutesToTime(current.draftTime, 5) }))}
                        >
                          +
                        </button>
                        <span>{i18n.t("schedule.minuteUnit")}</span>
                        <button
                          type="button"
                          className="pm-secondary-cta time-adjust-button"
                          aria-label={i18n.t("schedule.minuteDown")}
                          onClick={() => setTimePickerState((current) => ({ ...current, draftTime: addMinutesToTime(current.draftTime, -5) }))}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sheet-actions">
                    <button type="button" className="pm-secondary-cta" onClick={closeTimePicker}>
                      {i18n.t("schedule.cancelPicker")}
                    </button>
                    <button type="button" className="pm-primary-cta" onClick={commitTimePicker}>
                      {i18n.t(timePickerState.mode === "add" ? "schedule.confirmAddTime" : "schedule.confirmEditTime")}
                    </button>
                  </div>
                </section>
              </div>
            )}

            <button
              type="button"
              className="pm-primary-cta"
              onClick={() => { void scheduleSelectedMessage(); }}
            >
              {i18n.t("schedule.savePreview")}
            </button>

            <div className="preview-card">
              {state.notificationMessage && (
                <p className={`safety-message ${state.notificationStatus === "scheduled" ? "safe" : "caution"}`}>
                  {state.notificationMessage}
                </p>
              )}
              {schedulePreviewText ? (
                <>
                  <span className="preview-badge">{i18n.t("schedule.previewBadge")}</span>
                  <p className="preview-sentence">{schedulePreviewText}</p>
                  <p className="preview-note">{i18n.t("schedule.previewNote")}</p>
                </>
              ) : (
                <div className="preview-empty">{i18n.t("schedule.preview")}</div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════ SCREEN 5: Check-in (reopened) ═══════════ */}
	        {showAppFlow && state.step === 5 && state.sessionPhase === "reopened" && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("checkin.title")}</h2>
            <p className="screen-body">{i18n.t("checkin.body")}</p>

            {/* Yesterday line */}
            <div className="quote-card">
              <span className="preview-badge" style={{ marginBottom: 10, display: "inline-block" }}>
                {i18n.t("checkin.yesterdayLabel")}
              </span>
              <p className="quote-text">{state.selectedPraise}</p>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--pm-text-muted)", fontWeight: 400 }}>
                {i18n.t("checkin.yesterdaySaved", { time: scheduleSummary })}
              </p>
            </div>

            {/* 3 equal-weight check-in action cards */}
            <div className="button-stack">
              {/* 도움됐어 */}
              <button
                type="button"
                className="pm-choice-card green"
                aria-pressed={state.checkinAction === "keep"}
                onClick={() => {
                  const now = Date.now();
                  const newVault: VaultItem[] = state.vaultItems.some((item) => item.text === state.selectedPraise)
                    ? state.vaultItems
                    : [...state.vaultItems, {
                      id: `v-${now}`,
                      text: state.selectedPraise,
                      savedAt: now,
                    }];
                  const newWeeklyCare = getWeekCareArray(state.weeklyCare);
                  setState((current) => ({
                    ...current,
                    checkinAction: "keep",
                    step: 6,
                    vaultItems: newVault,
                    weeklyCare: newWeeklyCare,
                  }));
                  announce("checkin_completed", { source: state.reopenSource, sourceTag: state.sourceTag, action: "keep" });
                  announce("message_kept", { source: state.reopenSource, sourceTag: state.sourceTag });
                  announce("reopen_reason_tagged", { source: state.reopenSource, sourceTag: state.sourceTag, choice: "keep" });
                }}
              >
                <span className="choice-card-icon" aria-hidden="true">💚</span>
                <span className="choice-card-body">
                  <span className="choice-card-title">{i18n.t("checkin.keep")}</span>
                  <span className="choice-card-sub" aria-hidden="true">{i18n.t("checkin.keepSub")}</span>
                </span>
                <span className="choice-card-check" aria-hidden="true">{state.checkinAction === "keep" ? "✓" : ""}</span>
              </button>

              {/* 그냥 그랬어 */}
              <button
                type="button"
                className="pm-choice-card quiet"
                aria-pressed={state.checkinAction === "edit"}
                onClick={() => {
                  const newWeeklyCare = getWeekCareArray(state.weeklyCare);
                  setState((current) => ({
                    ...current,
                    checkinAction: "edit",
                    step: 6,
                    weeklyCare: newWeeklyCare,
                  }));
                  announce("checkin_completed", { source: state.reopenSource, sourceTag: state.sourceTag, action: "edit" });
                  announce("message_edited", { source: state.reopenSource, sourceTag: state.sourceTag });
                  announce("reopen_reason_tagged", { source: state.reopenSource, sourceTag: state.sourceTag, choice: "edit" });
                }}
              >
                <span className="choice-card-icon" aria-hidden="true">◻️</span>
                <span className="choice-card-body">
                  <span className="choice-card-title">{i18n.t("checkin.edit")}</span>
                  <span className="choice-card-sub" aria-hidden="true">{i18n.t("checkin.editSub")}</span>
                </span>
                <span className="choice-card-check" aria-hidden="true">{state.checkinAction === "edit" ? "✓" : ""}</span>
              </button>

              {/* 오늘은 바꿀래 */}
              <button
                type="button"
                className="pm-choice-card coral"
                aria-pressed={state.checkinAction === "skip"}
                onClick={() => {
                  const newWeeklyCare = getWeekCareArray(state.weeklyCare);
                  setState((current) => ({
                    ...current,
                    checkinAction: "skip",
                    step: 6,
                    weeklyCare: newWeeklyCare,
                  }));
                  announce("checkin_completed", { source: state.reopenSource, sourceTag: state.sourceTag, action: "skip" });
                  announce("message_skipped_today", { source: state.reopenSource, sourceTag: state.sourceTag });
                  announce("reopen_reason_tagged", { source: state.reopenSource, sourceTag: state.sourceTag, choice: "skip" });
                }}
              >
                <span className="choice-card-icon" aria-hidden="true">🔄</span>
                <span className="choice-card-body">
                  <span className="choice-card-title">{i18n.t("checkin.skip")}</span>
                  <span className="choice-card-sub" aria-hidden="true">{i18n.t("checkin.skipSub")}</span>
                </span>
                <span className="choice-card-check" aria-hidden="true">{state.checkinAction === "skip" ? "✓" : ""}</span>
              </button>
            </div>

            {/* Source tag */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--pm-text-muted)", fontSize: 13, fontWeight: 600 }}>
              <span>{i18n.t("checkin.tag")}</span>
              <select
                aria-label={i18n.t("checkin.tag")}
                value={state.reopenSource}
                onChange={(event) => setState((current) => ({ ...current, reopenSource: event.target.value as AppState["reopenSource"] }))}
                style={{
                  flex: 1,
                  minHeight: 44,
                  padding: "0 12px",
                  color: "var(--pm-text-strong)",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "var(--pm-surface)",
                  border: "1.5px solid var(--pm-border)",
                  borderRadius: "var(--pm-radius-pill, 999px)",
                }}
              >
                <option value="manual">{i18n.t("reopen.manual")}</option>
                <option value="notification">{i18n.t("reopen.notification")}</option>
                <option value="unknown">{i18n.t("reopen.unknown")}</option>
              </select>
            </label>
          </section>
        )}

        {/* ═══════════ SCREEN 6: Result / Fake-door ═══════════ */}
	        {showAppFlow && state.step === 6 && state.sessionPhase === "reopened" && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("result.title")}</h2>

            <div className="result-summary">
              <p style={{ margin: 0, fontSize: "clamp(20px, 6vw, 24px)", fontWeight: 750, lineHeight: 1.4, color: "var(--pm-text-strong)", wordBreak: "keep-all" }}>
                {resultSummaryText}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 15, fontWeight: 500, color: "var(--pm-text-muted)", wordBreak: "keep-all" }}>
                {state.selectedPraise}
              </p>
            </div>

            <div className="fake-door-card">
              <p>{i18n.t("result.cta")}</p>
              <p>{i18n.t("result.notice")}</p>
              <div className="result-action-row" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="pm-secondary-cta"
                  style={{ fontSize: 14 }}
                  onClick={() => { setState((current) => ({ ...current, interestAction: "dismissed" })); announce("vault_interest_handled", { source: state.reopenSource, status: "dismissed" }); }}
                >
                  {i18n.t("result.dismiss")}
                </button>
                <button
                  type="button"
                  className="pm-primary-cta"
                  style={{ fontSize: 14 }}
                  onClick={() => { setState((current) => ({ ...current, interestAction: "registered" })); announce("vault_interest_clicked", { source: state.reopenSource }); announce("vault_interest_handled", { source: state.reopenSource, status: "registered" }); }}
                >
                  {i18n.t("result.register")}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="pm-text-action"
              onClick={() => setState((current) => ({ ...current, step: 1, selectedPraise: "", selectedPraiseId: null, rewriteText: "", previewText: "", sessionPhase: "initial", checkinAction: null, interestAction: null, safetyState: "safe", selectedEmotion: null }))}
            >
              {i18n.t("navigation.restart")}
            </button>
          </section>
        )}

        {/* ═══════════ Language switcher compact (Screens 2-6) ═══════════ */}
        {showAppFlow && state.step >= 2 && !showHome && (
          <div style={{ position: "relative", width: "100%", maxWidth: 430, margin: "0 auto" }}>
            <button
              type="button"
              className="lang-compact"
              aria-label={i18n.t("settings.language")}
              onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
            >
              {locale === "ko" ? "A/가" : "EN"}
            </button>
          </div>
        )}

        {showAppFlow && (
          <footer style={{ textAlign: "center", padding: "24px 0 8px", fontSize: 12, color: "var(--pm-text-soft)", fontWeight: 500 }}>
            <p style={{ margin: 0 }}>{i18n.t("schedule.previewOnly")}</p>
          </footer>
        )}
      </div>

      {/* ────── Bottom Navigation ────── */}
      {showBottomNav && (
        <nav className="bottom-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-item${state.navTab === "home" ? " active" : ""}`}
            onClick={() => setState((current) => ({
              ...current,
              navTab: "home",
              sessionPhase: "initial",
              step: current.savedAt ? 4 : 1,
            }))}
          >
            <span className="nav-icon">🏠</span>
            {i18n.t("nav.home")}
          </button>
          <button
            type="button"
            className={`nav-item${state.navTab === "vault" ? " active" : ""}`}
            onClick={() => setState((current) => ({ ...current, navTab: "vault" }))}
          >
            <span className="nav-icon">📦</span>
            {i18n.t("nav.vault")}
          </button>
          <button
            type="button"
            className={`nav-item${state.navTab === "settings" ? " active" : ""}`}
            onClick={() => setState((current) => ({ ...current, navTab: "settings" }))}
          >
            <span className="nav-icon">⚙️</span>
            {i18n.t("nav.settings")}
          </button>
        </nav>
      )}

      {/* ────── Vault view ────── */}
      {state.navTab === "vault" && !showHome && (
        <section className="screen-section" style={{ paddingTop: 20 }}>
          <div className="home-header">
            <h2 className="home-headline">{i18n.t("vault.title")}</h2>
            {state.vaultItems.length > 0 && (
              <p className="home-support" style={{ marginTop: 4 }}>
                {i18n.t("vault.count", { count: state.vaultItems.length })}
              </p>
            )}
          </div>

          {state.vaultItems.length === 0 ? (
            <div className="preview-card" style={{ textAlign: "center" }}>
              <div className="preview-empty" style={{ whiteSpace: "pre-line" }}>
                {i18n.t("vault.empty")}
              </div>
            </div>
          ) : (
            <div className="button-stack">
              {state.vaultItems.map((item) => (
                <div key={item.id} className="vault-card">
                  <p className="vault-sentence">{item.text}</p>
                  <p className="vault-date">
                    {new Date(item.savedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { month: "long", day: "numeric" })}
                  </p>
                  <div className="vault-actions">
                    <button
                      type="button"
                      className="pm-text-action"
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          selectedPraise: item.text,
                          selectedPraiseId: null,
                          rewriteText: item.text,
                          step: 2,
                          navTab: "home",
                        }));
                      }}
                    >
                      {i18n.t("vault.reuse")}
                    </button>
                    <button
                      type="button"
                      className="pm-text-action"
                      style={{ color: "var(--pm-danger-text)" }}
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          vaultItems: current.vaultItems.filter((v) => v.id !== item.id),
                        }));
                      }}
                    >
                      {i18n.t("vault.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ────── Settings view ────── */}
      {state.navTab === "settings" && !showHome && (
        <section className="screen-section" style={{ paddingTop: 20 }}>
          <div className="home-header">
            <h2 className="home-headline">{i18n.t("settings.title")}</h2>
            <p className="home-support">{i18n.t("settings.languageBody")}</p>
          </div>

          <div className="settings-card">
            <span className="preview-badge">{i18n.t("schedule.previewOnly")}</span>
            <div>
              <h3>{i18n.t("settings.notificationTitle")}</h3>
              <p>{i18n.t("settings.notificationStatus")}</p>
            </div>
            <p className="settings-note">{i18n.t("settings.notificationBody")}</p>
            <div className="settings-row">
              <span>{i18n.t("settings.savedTime")}</span>
              <strong>{scheduleSummary}</strong>
            </div>
          </div>

          <div className="settings-card">
            <div>
              <h3>{i18n.t("privacy.title")}</h3>
              <p>{i18n.t("privacy.body")}</p>
            </div>
            <p className="settings-note">{i18n.t("privacy.localNotice")}</p>
            <a className="pm-secondary-cta" href={privacyPolicyUrl} target="_blank" rel="noreferrer">
              {i18n.t("privacy.openPolicy")}
            </a>
            <button
              type="button"
              className="pm-secondary-cta"
              onClick={() => {
                platformAdapters.storage.clearAll();
                setLocale("ko");
                setState(createDefaultState());
                announce("local_data_cleared", { source: state.sourceTag });
              }}
            >
              {i18n.t("privacy.clearLocal")}
            </button>
          </div>

          <div className="settings-card">
            <div>
              <h3>{i18n.t("settings.language")}</h3>
              <p>{i18n.t("settings.languageBody")}</p>
            </div>
            <div className="language-switcher" aria-label={i18n.t("settings.language")}>
              {localeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`lang-option${locale === option.id ? " is-selected" : ""}`}
                  aria-pressed={locale === option.id}
                  onClick={() => setLocale(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
