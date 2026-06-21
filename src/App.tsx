import { useEffect, useMemo, useRef, useState } from "react";
import { createI18n, isLocale, localeOptions, type Locale } from "./i18n";
import { sanitizeAnalytics } from "./core/analyticsSanitizer";
import { createMvpPlatformAdapters } from "./platform/adapters";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
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
  selectedPraiseId: string | null;
  selectedPraise: string;
  selectedEmotion: string | null;
  rewriteText: string;
  scheduleTime: string;
  previewText: string;
  checkinAction: CheckinAction | null;
  reopenSource: "manual" | "notification" | "unknown";
  safetyState: "safe" | "caution" | "blocked";
  interestAction: InterestAction | null;
  sessionPhase: "initial" | "reopened";
  savedAt: number | null;
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

const cautionKeywords = ["한심", "왜 맨날", "넌 왜"];
const blockedKeywords = ["죽어", "자해", "폭력", "진단", "치료"];

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

const weekDayKeys = ["weekly.sun", "weekly.mon", "weekly.tue", "weekly.wed", "weekly.thu", "weekly.fri", "weekly.sat"] as const;

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

export default function App() {
  const platformAdapters = useMemo(() => createMvpPlatformAdapters(), []);
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = platformAdapters.storage.loadLocale();
    return isLocale(stored) ? stored : "ko";
  });
  const i18n = useMemo(() => createI18n(locale), [locale]);

  const createDefaultState = (): AppState => ({
    sourceTag: "channel-direct",
    step: 1,
    targetConfirmed: false,
    selectedPraiseId: null,
    selectedPraise: "",
    selectedEmotion: null,
    rewriteText: "",
    scheduleTime: "21:30",
    previewText: "",
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
          reopenSource: parsedState.reopenSource === "manual" || parsedState.reopenSource === "notification"
            ? parsedState.reopenSource : "unknown",
        };
      }
      return { ...createDefaultState(), ...parsedState };
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

  useEffect(() => {
    platformAdapters.storage.saveLocale(locale);
  }, [locale, platformAdapters.storage]);

  useEffect(() => {
    platformAdapters.storage.setItem("state", JSON.stringify(state));
  }, [state, platformAdapters.storage]);

  const announce = (eventName: string, properties: Record<string, unknown>) => {
    void platformAdapters.analytics.track(eventName, sanitizeAnalytics({ event: eventName, ...properties }));
  };

  useEffect(() => {
    announce("landing_viewed", { source: state.sourceTag, locale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPreview = state.previewText || i18n.t("preview.fallback");
  const rewriteMessage: { message: string; safety: "safe" | "caution" | "blocked" } = (() => {
    const text = state.rewriteText.trim();
    if (!text) return { message: "", safety: "safe" as const };
    if (blockedKeywords.some((keyword) => text.includes(keyword))) return { message: i18n.t("rewrite.blocked"), safety: "blocked" as const };
    if (cautionKeywords.some((keyword) => text.includes(keyword)) || text.length < 8) return { message: i18n.t("rewrite.caution"), safety: "caution" as const };
    return { message: "", safety: "safe" as const };
  })();

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

  const visiblePraiseOptions = revealed
    ? allPraiseOptions
    : allPraiseOptions.filter((item) => initialPraiseIds.includes(item.id));

  const resultSummaryText = (() => {
    if (state.checkinAction === "keep") return i18n.t("result.summaryKeep");
    if (state.checkinAction === "skip") return i18n.t("result.summarySkip");
    return i18n.t("result.summaryEdit");
  })();

  const hasActiveSession = state.savedAt !== null;
  const showHome = hasActiveSession && state.sessionPhase === "initial" && state.step === 4;
  const weekCare = state.weeklyCare.length === 7 ? state.weeklyCare : [0,0,0,0,0,0,0];
  const weekCareCount = countWeekCare(weekCare);

  return (
    <main className="app-shell" aria-label={i18n.t("app.aria")}>
      <div className="app-home">
        {/* ────── Progress rail ────── */}
        {!showHome && (
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
              <p className="hero-sub">{i18n.t("home.heroLine", { time: state.scheduleTime })}</p>
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
        {state.step === 1 && (
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

        {/* ═══════════ SCREEN 2: Emotion + Praise Pick ═══════════ */}
        {state.step === 2 && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("praise.title")}</h2>

            {/* Emotion chips row */}
            <div style={{ marginBottom: 8 }}>
              <p className="screen-body">{i18n.t("emotion.title")}</p>
              <div className="emotion-chip-row" style={{ marginTop: 12 }}>
                {emotionChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={`emotion-chip ${chip.color}${state.selectedEmotion === chip.id ? " selected" : ""}`}
                    onClick={() => setState((current) => ({ ...current, selectedEmotion: chip.id }))}
                  >
                    <span className="chip-icon" aria-hidden="true">{chip.icon}</span>
                    <span className="chip-title">{i18n.t(chip.i18nKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="screen-body">{i18n.t("praise.body")}</p>

            <div className="button-stack">
              {visiblePraiseOptions.map((option, idx) => {
                const colorVariants = ["coral", "blue", "violet", "green", "amber"] as const;
                const colorClass = colorVariants[idx % colorVariants.length];
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`pm-choice-card ${colorClass}`}
                    aria-pressed={state.selectedPraiseId === option.id}
                    onClick={() => selectPraise(option.id)}
                  >
                    <span className="choice-card-icon" aria-hidden="true">{choiceIcons[option.id] ?? "💛"}</span>
                    <span className="choice-card-body">
                      <span className="choice-card-title">{locale === "ko" ? option.ko : option.en}</span>
                    </span>
                    <span className="choice-card-check" aria-hidden="true">{state.selectedPraiseId === option.id ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>

            {!revealed && (
              <button type="button" className="pm-text-action" onClick={() => setRevealed(true)}>
                {i18n.t("praise.reveal")}
              </button>
            )}

            <button
              type="button"
              className="pm-primary-cta"
              disabled={!state.selectedPraiseId}
              onClick={() => { setState((current) => ({ ...current, step: 3 })); }}
            >
              {i18n.t("praise.continue")}
            </button>
          </section>
        )}

        {/* ═══════════ SCREEN 3: Rewrite Optional ═══════════ */}
        {state.step === 3 && (
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
        {state.step === 4 && !showHome && (
          <section className="screen-section">
            <h2 className="screen-title">{i18n.t("schedule.title")}</h2>
            <p className="screen-body">{i18n.t("schedule.body")}</p>

            <div className="time-card">
              <span style={{ color: "var(--pm-text-muted)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                {i18n.t("schedule.label")}
              </span>
              <input
                aria-label={i18n.t("schedule.label")}
                type="time"
                value={state.scheduleTime}
                onChange={(event) => setState((current) => ({ ...current, scheduleTime: event.target.value }))}
              />
            </div>

            <button
              type="button"
              className="pm-primary-cta"
              onClick={() => {
                announce("schedule_started", { source: state.sourceTag, sourceTag: state.sourceTag });
                const now = Date.now();
                const newWeeklyCare = getWeekCareArray(state.weeklyCare);
                setState((current) => ({
                  ...current,
                  previewText: current.selectedPraise || current.rewriteText || selectedPreview,
                  savedAt: now,
                  step: 4,
                  sessionPhase: "initial",
                  weeklyCare: newWeeklyCare,
                }));
                announce("reminder_created", { source: state.sourceTag, time: state.scheduleTime });
                announce("preview_viewed", { source: state.sourceTag, sourceTag: state.sourceTag });
              }}
            >
              {i18n.t("schedule.savePreview")}
            </button>

            <div className="preview-card">
              {state.previewText ? (
                <>
                  <span className="preview-badge">{i18n.t("schedule.previewBadge")}</span>
                  <p className="preview-sentence">{selectedPreview}</p>
                  <p className="preview-note">{i18n.t("schedule.previewNote")}</p>
                </>
              ) : (
                <div className="preview-empty">{i18n.t("schedule.preview")}</div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════ SCREEN 5: Check-in (reopened) ═══════════ */}
        {state.step === 5 && state.sessionPhase === "reopened" && (
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
                {i18n.t("checkin.yesterdaySaved", { time: state.scheduleTime })}
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
                  const newVault: VaultItem[] = [...state.vaultItems, {
                    id: `v-${Date.now()}`,
                    text: state.selectedPraise,
                    savedAt: Date.now(),
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
        {state.step === 6 && state.sessionPhase === "reopened" && (
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
        {state.step >= 2 && !showHome && (
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

        <footer style={{ textAlign: "center", padding: "24px 0 8px", fontSize: 12, color: "var(--pm-text-soft)", fontWeight: 500 }}>
          <p style={{ margin: 0 }}>{i18n.t("schedule.previewOnly")}</p>
        </footer>
      </div>

      {/* ────── Bottom Navigation (shown on home and vault) ────── */}
      {(showHome || state.navTab === "vault") && (
        <nav className="bottom-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-item${state.navTab === "home" || showHome ? " active" : ""}`}
            onClick={() => setState((current) => ({ ...current, navTab: "home" }))}
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
            className="nav-item"
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
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
    </main>
  );
}
