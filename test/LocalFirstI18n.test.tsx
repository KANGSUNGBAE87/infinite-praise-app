import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const trackedEvents: Array<{ eventName: string; properties?: Record<string, unknown> | undefined }> = [];

vi.mock("../src/platform/adapters", () => ({
  createMvpPlatformAdapters: () => ({
    auth: { status: "stub", plannedProviders: ["apps_in_toss", "google_play"], async getCurrentUser() { return { status: "anonymous" as const }; } },
    payment: { status: "stub", plannedStores: ["apps_in_toss_iap", "google_play_billing"], async hasEntitlement() { return false; } },
    ads: { status: "stub", plannedNetworks: ["apps_in_toss_ads", "admob"], async showPlacement() { return { shown: false, reason: "ads_disabled_in_mvp" as const }; } },
    storage: {
      status: "stub",
      loadLocale() { return window.localStorage.getItem("praise-me:locale-v1"); },
      saveLocale(locale: string) { window.localStorage.setItem("praise-me:locale-v1", locale); },
      getItem(key: string) { return window.localStorage.getItem(`praise-me:${key}`); },
      setItem(key: string, value: string) { window.localStorage.setItem(`praise-me:${key}`, value); },
      removeItem(key: string) { window.localStorage.removeItem(`praise-me:${key}`); },
      clearAll() { window.localStorage.clear(); },
    },
    analytics: { status: "stub", async track(eventName: string, properties: Record<string, unknown> = {}) { trackedEvents.push({ eventName, properties }); return { tracked: false, reason: "analytics_disabled_in_mvp" as const }; } },
    notifications: { status: "stub", capability: "preview_only", async getPermissionStatus() { return "unsupported" as const; }, async requestPermission() { return "unsupported" as const; }, async scheduleReminder() { return { status: "preview_only" as const, reason: "notifications_stubbed_in_mvp" as const }; }, async cancelReminder() { return { canceled: false, reason: "notifications_stubbed_in_mvp" }; } },
  }),
}));

describe("칭찬해줘 v0.4: local-first persistence + i18n", () => {
  beforeEach(() => {
    trackedEvents.length = 0;
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  // ============================================================
  // LOCAL-FIRST PERSISTENCE & RELOAD BEHAVIOR
  // ============================================================

  it("persists app state to localStorage on every state change", async () => {
    const user = userEvent.setup();
    render(<App />);

    const initialState = window.localStorage.getItem("praise-me:state");
    expect(initialState).not.toBeNull();
    const parsed = JSON.parse(initialState!);
    expect(parsed.step).toBe(1);
    expect(parsed.sessionPhase).toBe("initial");

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    const step2State = JSON.parse(window.localStorage.getItem("praise-me:state")!);
    expect(step2State.step).toBe(2);
    expect(step2State.targetConfirmed).toBe(true);

    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    const praisedState = JSON.parse(window.localStorage.getItem("praise-me:state")!);
    expect(praisedState.selectedPraiseId).toBe("p1");
  });

  it("restores state from localStorage on fresh render (reopened session)", () => {
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 5,
        targetConfirmed: true,
        selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.",
        rewriteText: "오늘은 할 만큼 했어.",
        scheduleTime: "21:30",
        previewText: "오늘 버틴 것만으로도 충분히 잘했어.",
        checkinAction: null,
        reopenSource: "manual",
        safetyState: "safe",
        interestAction: null,
        sessionPhase: "reopened",
        savedAt: Date.now(),
      })
    );

    render(<App />);

    expect(screen.getByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "오늘을 조금 덜 가혹하게 마무리해볼까요?" })).not.toBeInTheDocument();
  });

  it("forces reopened session to minimum step 5 regardless of saved step", () => {
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 3,
        targetConfirmed: true,
        selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.",
        rewriteText: "test",
        scheduleTime: "21:30",
        previewText: "test",
        checkinAction: null,
        reopenSource: "unknown",
        safetyState: "safe",
        interestAction: null,
        sessionPhase: "reopened",
        savedAt: Date.now(),
      })
    );

    render(<App />);
    expect(screen.getByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).toBeInTheDocument();
    expect(screen.queryByText("원하면 내 말로 조금 바꿔요")).not.toBeInTheDocument();
  });

  it("falls back to default state when localStorage is empty", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "오늘을 조금 덜 가혹하게 마무리해볼까요?" })).toBeInTheDocument();
  });

  it("falls back to default state when localStorage state is corrupted", () => {
    window.localStorage.setItem("praise-me:state", "not-valid-json{");
    render(<App />);
    expect(screen.getByRole("heading", { name: "오늘을 조금 덜 가혹하게 마무리해볼까요?" })).toBeInTheDocument();
    expect(window.localStorage.getItem("praise-me:state")).not.toBeNull();
    expect(() => JSON.parse(window.localStorage.getItem("praise-me:state")!)).not.toThrow();
  });

  // ============================================================
  // I18N — KO/EN LABEL VERIFICATION
  // ============================================================

  it("renders all landing screen labels in Korean (default)", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "칭찬해줘", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘을 조금 덜 가혹하게 마무리해볼까요?" })).toBeInTheDocument();
    expect(screen.getByText("하루에 한 줄만, 내 편이 되어보세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "오늘의 한 줄 고르기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지금은 아니에요" })).toBeInTheDocument();
    expect(screen.getAllByText("미리보기 전용").length).toBeGreaterThanOrEqual(1);
  });

  it("renders all landing screen labels in English after locale switch", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("heading", { name: "Praise Me", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Want to end today a little less harshly?" })).toBeInTheDocument();
    expect(screen.getByText("One line a day. Be on your own side.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pick today's line" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not now" })).toBeInTheDocument();
  });

  it("renders praise screen labels in both ko and en", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));

    // KO
    expect(screen.getByRole("heading", { name: "오늘의 한 줄" })).toBeInTheDocument();
    expect(screen.getByText("하나를 고르면 비슷한 결의 한 줄을 보여드려요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ })).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Today's line" })).toBeInTheDocument();
    expect(screen.getByText("Pick your mood and we'll suggest a matching line.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Just making it through today was more than enough/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Just getting here was already an achievement/ })).toBeInTheDocument();
  });

  it("renders rewrite screen labels in both ko and en", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));

    // KO
    expect(screen.getByRole("heading", { name: "원하면 내 말로 조금 바꿔요" })).toBeInTheDocument();
    expect(screen.getAllByText("짧게만 수정해도 충분해요.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "이 문장으로 저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "원래 문장으로 돌아가기" })).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Want to make it yours?" })).toBeInTheDocument();
    expect(screen.getAllByText("A tiny edit is enough.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Save this version" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go back to original" })).toBeInTheDocument();
  });

  it("renders schedule screen labels in both ko and en", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));

    // KO
    expect(screen.getByRole("heading", { name: "다시 보고 싶은 시간을 정해보세요" })).toBeInTheDocument();
    expect(screen.getByText("앱 안에서 미리보기로 저장돼요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장하고 미리보기" })).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "When do you want to revisit this?" })).toBeInTheDocument();
    expect(screen.getByText("Saved as a preview inside the app.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save & Preview" })).toBeInTheDocument();
  });

  it("renders check-in (D1 reopen) labels in both ko and en", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 5, targetConfirmed: true, selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.", rewriteText: "test",
        scheduleTime: "21:30", previewText: "test", checkinAction: null,
        reopenSource: "manual", safetyState: "safe", interestAction: null,
        sessionPhase: "reopened", savedAt: Date.now(),
      })
    );
    render(<App />);

    // KO
    expect(screen.getByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).toBeInTheDocument();
    expect(screen.getByText("정답은 없어요. 지금 느낌에 가까운 걸 골라주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "도움됐어" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "그냥 그랬어" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "오늘은 바꿀래" })).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Yesterday's line \u2014 how was it?" })).toBeInTheDocument();
    expect(screen.getByText("No right answer. Pick what feels closest.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "It helped" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "It was okay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change it today" })).toBeInTheDocument();
  });

  it("renders result screen labels in both ko and en", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 5, targetConfirmed: true, selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.", rewriteText: "test",
        scheduleTime: "21:30", previewText: "test", checkinAction: null,
        reopenSource: "manual", safetyState: "safe", interestAction: null,
        sessionPhase: "reopened", savedAt: Date.now(),
      })
    );
    render(<App />);
    await user.click(screen.getByRole("button", { name: "도움됐어" }));

    // KO
    expect(screen.getByRole("heading", { name: "확인 완료" })).toBeInTheDocument();
    expect(screen.getByText("마음에 든 한 줄 보관함 보기")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "관심 없음" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "관심 등록" })).toBeInTheDocument();
    expect(screen.getByText("가격, 결제, 할인 문구는 보여주지 않아요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "처음부터" })).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Check-in done" })).toBeInTheDocument();
    expect(screen.getByText("See the favorite-line vault")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not interested" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register interest" })).toBeInTheDocument();
    expect(screen.getByText("No price, payment, or discount copy is shown.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument();
  });

  it("persists locale choice across re-renders via localStorage", () => {
    window.localStorage.setItem("praise-me:locale-v1", "en");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Praise Me", level: 1 })).toBeInTheDocument();
  });

  it("renders caution and blocked labels in both ko and en on rewrite screen", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "넌 왜 맨날 이러냐");

    // KO caution
    expect(screen.getByText("이 문구는 조금 더 다정하게 바꿔도 좋아요.")).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByText("This line could be a little gentler.")).toBeInTheDocument();

    // Type blocked text
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "죽어");
    expect(screen.getByText("This line cannot be saved.")).toBeInTheDocument();

    // Switch back to KO via compact icon
    await user.click(screen.getByText("EN"));
    expect(screen.getByText("이 문구는 저장할 수 없어요.")).toBeInTheDocument();
  });

  it("renders navigation and progress labels correctly in both locales", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));

    // KO progress rail + CTA
    expect(screen.getByText("시작")).toBeInTheDocument();
    expect(screen.getByText("선택")).toBeInTheDocument();
    expect(screen.getByText("수정")).toBeInTheDocument();
    expect(screen.getByText("저장")).toBeInTheDocument();
    expect(screen.getByText("확인")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 한 줄로 할게요" })).toBeInTheDocument();

    // Switch to EN via compact icon
    await user.click(screen.getByText("A/가"));
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Choose")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Check")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I'll go with this one" })).toBeInTheDocument();
  });

  it("renders reopen source labels (manual/notification/unknown) in both locales", async () => {
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 5, targetConfirmed: true, selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.", rewriteText: "test",
        scheduleTime: "21:30", previewText: "test", checkinAction: null,
        reopenSource: "manual", safetyState: "safe", interestAction: null,
        sessionPhase: "reopened", savedAt: Date.now(),
      })
    );
    const { unmount } = render(<App />);

    // KO reopen labels in select
    expect(screen.getByText("직접 다시 열었어요")).toBeInTheDocument();
    expect(screen.getByText("알림을 눌렀어요")).toBeInTheDocument();
    expect(screen.getByText("알림 또는 직접 다시 열었어요")).toBeInTheDocument();

    cleanup();
    window.localStorage.clear();
    window.localStorage.setItem("praise-me:locale-v1", "en");
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 5, targetConfirmed: true, selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.", rewriteText: "test",
        scheduleTime: "21:30", previewText: "test", checkinAction: null,
        reopenSource: "manual", safetyState: "safe", interestAction: null,
        sessionPhase: "reopened", savedAt: Date.now(),
      })
    );
    render(<App />);

    // EN reopen labels in select
    expect(screen.getByText("Opened manually")).toBeInTheDocument();
    expect(screen.getByText("Opened from a notification")).toBeInTheDocument();
    expect(screen.getByText("Opened from a notification or manually")).toBeInTheDocument();
  });

  it("local-first: no network calls during full flow", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    await user.click(screen.getByRole("button", { name: "저장하고 미리보기" }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
