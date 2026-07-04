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
    notifications: {
      status: "enabled",
      capability: "permission_required",
      async getPermissionStatus() { return "unsupported" as const; },
      async requestPermission() { return "unsupported" as const; },
      async scheduleReminder() { return { status: "blocked" as const, reason: "unsupported" as const }; },
      async cancelReminder() { return { canceled: false, reason: "unsupported" }; },
    },
  }),
}));

describe("내편한마디 v0.5: AI candidate flow + local persistence + i18n", () => {
  const stubAiFailure = () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  };

  const openAiCandidateScreen = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));
  };

  const openRewriteScreen = async (user: ReturnType<typeof userEvent.setup>) => {
    stubAiFailure();
    await openAiCandidateScreen(user);
    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "오늘 발표를 끝냈어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));
    expect(await screen.findAllByText("기본 후보")).toHaveLength(5);
    const candidates = await screen.findAllByRole("button", { name: /오늘 발표를 끝냈어/ });
    await user.click(candidates[0]!);
    await user.click(screen.getByRole("button", { name: "이 한마디로 계속" }));
  };

  beforeEach(() => {
    trackedEvents.length = 0;
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
    cleanup();
  });

  it("persists app state while keeping generation context and candidate drafts out of localStorage", async () => {
    const user = userEvent.setup();
    stubAiFailure();
    await openAiCandidateScreen(user);

    const step2State = JSON.parse(window.localStorage.getItem("praise-me:state")!);
    expect(step2State.step).toBe(2);
    expect(step2State.targetConfirmed).toBe(true);

    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "오늘 발표를 끝냈어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));
    expect(await screen.findAllByText("기본 후보")).toHaveLength(5);

    const generatedStateText = window.localStorage.getItem("praise-me:state")!;
    const generatedState = JSON.parse(generatedStateText);
    expect(generatedState.generationContext).toBe("");
    expect(generatedState.generatedCandidates).toEqual([]);
    expect(generatedStateText).not.toContain("오늘 발표를 끝냈어");

    const candidates = await screen.findAllByRole("button", { name: /오늘 발표를 끝냈어/ });
    await user.click(candidates[0]!);
    const selectedState = JSON.parse(window.localStorage.getItem("praise-me:state")!);
    expect(selectedState.selectedPraiseId).toBe("fallback-praise-1");
    expect(selectedState.selectedPraise).toContain("오늘 발표를 끝냈어");
  });

  it("restores reopened sessions from localStorage and protects against corrupted state", () => {
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 3,
        targetConfirmed: true,
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.",
        rewriteText: "test",
        scheduleTime: "21:30",
        previewText: "test",
        checkinAction: null,
        reopenSource: "manual",
        safetyState: "safe",
        interestAction: null,
        sessionPhase: "reopened",
        savedAt: Date.now(),
      })
    );
    const { unmount } = render(<App />);
    expect(screen.getByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).toBeInTheDocument();
    expect(screen.queryByText("원하면 내 말로 조금 바꿔요")).not.toBeInTheDocument();

    unmount();
    window.localStorage.setItem("praise-me:state", "not-valid-json{");
    render(<App />);
    expect(screen.getByRole("heading", { name: "지금 나에게 필요한 말을 만들어볼까요?" })).toBeInTheDocument();
    expect(() => JSON.parse(window.localStorage.getItem("praise-me:state")!)).not.toThrow();
  });

  it("renders landing labels in Korean and English", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "내편한마디", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "지금 나에게 필요한 말을 만들어볼까요?" })).toBeInTheDocument();
    expect(screen.getByText("칭찬이 필요할 때도, 잔소리가 필요할 때도 내 편에서 말해주는 한마디를 만들어요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI로 한마디 만들기" })).toBeInTheDocument();
    expect(screen.getByText("AI 후보와 알림은 권한 상태에 따라 동작해요.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("heading", { name: "A Word for Me", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Want the words you need right now?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Make a line with AI" })).toBeInTheDocument();
  });

  it("renders AI candidate screen labels in both locales", async () => {
    const user = userEvent.setup();
    await openAiCandidateScreen(user);

    expect(screen.getByRole("heading", { name: "칭찬해줘 / 잔소리해줘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "칭찬해줘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "잔소리해줘" })).toBeInTheDocument();
    expect(screen.getByText("AI가 만든 후보에는 라벨이 붙고, 불편한 문구는 바로 신고할 수 있어요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 후보 5개 만들기" })).toBeInTheDocument();

    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Praise me / Nudge me" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Praise me" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nudge me" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate 5 AI candidates" })).toBeInTheDocument();
  });

  it("renders rewrite and safety labels in both locales", async () => {
    const user = userEvent.setup();
    await openRewriteScreen(user);

    expect(screen.getByRole("heading", { name: "원하면 내 말로 조금 바꿔요" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 문장으로 저장" })).toBeInTheDocument();
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "넌 왜 맨날 이러냐");
    expect(screen.getByText("이 문구는 조금 더 다정하게 바꿔도 좋아요.")).toBeInTheDocument();

    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Want to make it yours?" })).toBeInTheDocument();
    expect(screen.getByText("This line could be a little gentler.")).toBeInTheDocument();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "죽어");
    expect(screen.getByText("This line cannot be saved.")).toBeInTheDocument();

    await user.click(screen.getByText("EN"));
    expect(screen.getByText("이 문구는 저장할 수 없어요.")).toBeInTheDocument();
  });

  it("renders schedule screen labels in both locales", async () => {
    const user = userEvent.setup();
    await openRewriteScreen(user);
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));

    expect(screen.getByRole("heading", { name: "다시 보고 싶은 시간을 정해보세요" })).toBeInTheDocument();
    expect(screen.getByText("권한을 허용하면 브라우저 알림으로 다시 알려드려요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "알림 예약하고 미리보기" })).toBeInTheDocument();

    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "When do you want to revisit this?" })).toBeInTheDocument();
    expect(screen.getByText("If you allow permission, the browser can notify you at the saved time.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schedule notification & preview" })).toBeInTheDocument();
  });

  it("renders check-in result and reopen source labels in both locales", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 5,
        targetConfirmed: true,
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.",
        rewriteText: "test",
        scheduleTime: "21:30",
        previewText: "test",
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
    expect(screen.getByText("직접 다시 열었어요")).toBeInTheDocument();
    expect(screen.getByText("알림을 눌렀어요")).toBeInTheDocument();
    expect(screen.getByText("알림 또는 직접 다시 열었어요")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "도움됐어" }));
    expect(screen.getByRole("heading", { name: "확인 완료" })).toBeInTheDocument();
    expect(screen.getByText("마음에 든 한 줄 보관함 보기")).toBeInTheDocument();

    await user.click(screen.getByText("A/가"));
    expect(screen.getByRole("heading", { name: "Check-in done" })).toBeInTheDocument();
    expect(screen.getByText("See the favorite-line vault")).toBeInTheDocument();
  });

  it("persists locale choice across re-renders via localStorage", () => {
    window.localStorage.setItem("praise-me:locale-v1", "en");
    render(<App />);
    expect(screen.getByRole("heading", { name: "A Word for Me", level: 1 })).toBeInTheDocument();
  });

  it("shows progress labels and calls the AI proxy only after explicit candidate generation", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    await openAiCandidateScreen(user);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("시작")).toBeInTheDocument();
    expect(screen.getByText("선택")).toBeInTheDocument();
    expect(screen.getByText("수정")).toBeInTheDocument();
    expect(screen.getByText("저장")).toBeInTheDocument();
    expect(screen.getByText("확인")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "오늘 발표를 끝냈어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));
    expect(await screen.findAllByText("기본 후보")).toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
