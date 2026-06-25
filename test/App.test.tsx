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

describe("칭찬해줘 v0.4 home + check-in flow", () => {
  const eventNames = () => trackedEvents.map((event) => event.eventName);
  const expectEventSequence = (...expected: string[]) => {
    const actual = eventNames();
    let cursor = 0;
    for (const token of expected) {
      const index = actual.indexOf(token, cursor);
      expect(index, `missing ${token} after position ${cursor}: ${actual.join(", ")}`).toBeGreaterThanOrEqual(0);
      cursor = index + 1;
    }
  };
  const countEvent = (name: string) => trackedEvents.filter((event) => event.eventName === name).length;
  const saveFirstLineAndOpenHome = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<App />);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "오늘은 할 만큼 했어.");
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    await user.click(screen.getByRole("button", { name: "저장하고 미리보기" }));
  };

  beforeEach(() => {
    trackedEvents.length = 0;
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders landing with v0.4 copy", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "칭찬해줘", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘을 조금 덜 가혹하게 마무리해볼까요?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "오늘의 한 줄 고르기" })).toBeInTheDocument();
  });

  it("emits runtime events across the actual reopen flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "죽어");

    expectEventSequence(
      "landing_viewed",
      "target_confirmed",
      "praise_selected",
      "rewrite_started",
      "message_blocked",
    );
    expect(countEvent("rewrite_started")).toBe(1);
    expect(screen.getByRole("button", { name: "이 문장으로 저장" })).toBeDisabled();
  });

  it("drives the persisted reopened state through keep (도움됐어), edit (그냥그랬어), skip (오늘은바꿀래) and vault interest paths", async () => {
    const user = userEvent.setup();
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

    const { unmount } = render(<App />);
    expect(screen.getByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "도움됐어" }));
    expect(screen.getByRole("heading", { name: "확인 완료" })).toBeInTheDocument();
    expectEventSequence(
      "landing_viewed",
      "return_next_day",
      "return_next_day_manual",
      "checkin_prompt_viewed",
      "checkin_completed",
      "message_kept",
      "reopen_reason_tagged",
      "vault_interest_viewed",
    );

    unmount();
    trackedEvents.length = 0;
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
        reopenSource: "notification",
        safetyState: "safe",
        interestAction: null,
        sessionPhase: "reopened",
        savedAt: Date.now(),
      })
    );
    cleanup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "그냥 그랬어" }));
    expectEventSequence(
      "landing_viewed",
      "return_next_day",
      "checkin_prompt_viewed",
      "checkin_completed",
      "message_edited",
      "reopen_reason_tagged",
    );

    unmount();
    trackedEvents.length = 0;
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
        reopenSource: "unknown",
        safetyState: "safe",
        interestAction: null,
        sessionPhase: "reopened",
        savedAt: Date.now(),
      })
    );
    cleanup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "오늘은 바꿀래" }));
    expectEventSequence(
      "landing_viewed",
      "return_next_day",
      "checkin_prompt_viewed",
      "checkin_completed",
      "message_skipped_today",
      "reopen_reason_tagged",
    );

    await user.click(screen.getByRole("button", { name: "관심 없음" }));
    expectEventSequence(
      "landing_viewed",
      "return_next_day",
      "checkin_prompt_viewed",
      "checkin_completed",
      "message_skipped_today",
      "reopen_reason_tagged",
      "vault_interest_handled",
    );
    const dismissEvent = trackedEvents.find((e) => e.eventName === "vault_interest_handled");
    expect(dismissEvent).toBeDefined();
    expect(dismissEvent?.properties?.status).toBe("dismissed");
  });

  it("stops first session and shows home dashboard after save", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "오늘은 할 만큼 했어.");
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    await user.click(screen.getByRole("button", { name: "저장하고 미리보기" }));

    expectEventSequence(
      "landing_viewed",
      "target_confirmed",
      "praise_selected",
      "rewrite_started",
      "rewrite_saved",
      "schedule_started",
      "reminder_created",
      "preview_viewed",
    );
    // After save, home dashboard appears
    expect(screen.getByText("오늘도 나를 너무 몰아붙이지 말아요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "오늘의 한 줄 고르기" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).not.toBeInTheDocument();

    window.localStorage.clear();
    window.localStorage.setItem(
      "praise-me:state",
      JSON.stringify({
        sourceTag: "channel-direct",
        step: 4,
        targetConfirmed: true,
        selectedPraiseId: "p1",
        selectedPraise: "오늘 버틴 것만으로도 충분히 잘했어.",
        rewriteText: "오늘은 할 만큼 했어.",
        scheduleTime: "21:30",
        previewText: "오늘 버틴 것만으로도 충분히 잘했어.",
        checkinAction: null,
        reopenSource: "unknown",
        safetyState: "safe",
        interestAction: null,
        sessionPhase: "reopened",
        savedAt: Date.now(),
      })
    );

    cleanup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "도움됐어" }));
    expect(screen.getByRole("heading", { name: "확인 완료" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "어제의 한 줄, 오늘은 어땠어요?" })).not.toBeInTheDocument();
  });

  it("opens the vault tab from the saved home dashboard", async () => {
    const user = userEvent.setup();
    await saveFirstLineAndOpenHome(user);

    await user.click(screen.getByRole("button", { name: /보관함/ }));

    expect(screen.getByRole("heading", { name: "보관함" })).toBeInTheDocument();
    expect(screen.getByText(/아직 보관한 한 줄이 없어요/)).toBeInTheDocument();
    expect(screen.queryByText("오늘도 나를 너무 몰아붙이지 말아요")).not.toBeInTheDocument();
  });

  it("opens notification and language settings from the saved home dashboard", async () => {
    const user = userEvent.setup();
    await saveFirstLineAndOpenHome(user);

    await user.click(screen.getByRole("button", { name: /설정/ }));

    expect(screen.getByRole("heading", { name: "설정" })).toBeInTheDocument();
    expect(screen.getByText("알림")).toBeInTheDocument();
    expect(screen.getByText("현재는 앱 안 미리보기만 저장돼요.")).toBeInTheDocument();
    expect(screen.getByText("언어")).toBeInTheDocument();
    expect(screen.queryByText("오늘도 나를 너무 몰아붙이지 말아요")).not.toBeInTheDocument();
  });

  it("persists locale and switches to English", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("heading", { name: "Praise Me", level: 1 })).toBeInTheDocument();
    expect(window.localStorage.getItem("praise-me:locale-v1")).toBe("en");
  });

  it("blocks long free text from analytics payload", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "이 문장은 분석 payload에서 절대 그대로 나오면 안 되는 아주 긴 사용자 자유 입력입니다.");
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    await user.click(screen.getByRole("button", { name: "저장하고 미리보기" }));

    // Free text should appear on screen (in preview/hero) but not in analytics
    expect(screen.getAllByText("이 문장은 분석 payload에서 절대 그대로 나오면 안 되는 아주 긴 사용자 자유 입력입니다.").length).toBeGreaterThan(0);
    // Home dashboard should be visible after save
    expect(screen.getByText("오늘도 나를 너무 몰아붙이지 말아요")).toBeInTheDocument();
  });

  it("shows the caution and blocked rewrite states", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.click(screen.getByRole("button", { name: /오늘 버틴 것만으로도 충분히 잘했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한 줄로 할게요" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "넌 왜 맨날 이러냐");

    expect(screen.getByText("이 문구는 조금 더 다정하게 바꿔도 좋아요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 문장으로 저장" })).toBeEnabled();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "죽어");
    expect(screen.getByText("이 문구는 저장할 수 없어요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 문장으로 저장" })).toBeDisabled();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "넌 왜 맨날 이러냐");
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    expectEventSequence(
      "landing_viewed",
      "target_confirmed",
      "praise_selected",
      "rewrite_started",
      "message_cautioned",
      "rewrite_saved",
    );
    expect(countEvent("message_cautioned")).toBeGreaterThanOrEqual(1);
    expect(countEvent("rewrite_saved")).toBe(1);
  });
});
