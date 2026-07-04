import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const trackedEvents: Array<{ eventName: string; properties?: Record<string, unknown> | undefined }> = [];
const scheduledNotifications: Array<{ id: string; title?: string; body?: string; scheduledAt?: number }> = [];

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
      async getPermissionStatus() { return "prompt" as const; },
      async requestPermission() { return "granted" as const; },
      async scheduleReminder(reminder: { id: string; title?: string; body?: string; scheduledAt?: number }) {
        scheduledNotifications.push(reminder);
        return { status: "scheduled" as const };
      },
      async cancelReminder() { return { canceled: true }; },
    },
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

  const praiseCandidates = [
    { id: "c1", text: "오늘 발표 끝낸 건 분명히 해낸 일이야.", notificationText: "발표 끝낸 너, 오늘 해냈어.", style: "warm", mode: "praise", source: "ai" },
    { id: "c2", text: "긴장했어도 끝까지 간 네가 멋져.", notificationText: "끝까지 간 네가 멋져.", style: "short", mode: "praise", source: "ai" },
    { id: "c3", text: "완벽하지 않아도 마친 건 사라지지 않아.", notificationText: "마친 건 사라지지 않아.", style: "practical", mode: "praise", source: "ai" },
    { id: "c4", text: "오늘은 스스로에게 잘했다고 해도 돼.", notificationText: "스스로에게 잘했다고 해도 돼.", style: "calm", mode: "praise", source: "ai" },
    { id: "c5", text: "발표를 마친 너는 이미 한 고비를 넘었어.", notificationText: "한 고비를 넘었어.", style: "direct", mode: "praise", source: "ai" },
  ];

  const nagCandidates = [
    { id: "c1", text: "생각은 충분히 했어. 이제 5분만 시작하자.", notificationText: "이제 5분만 시작하자.", style: "direct", mode: "nag", source: "ai" },
    { id: "c2", text: "폰은 내려두고 지금 첫 단계만 하자.", notificationText: "첫 단계만 하자.", style: "short", mode: "nag", source: "ai" },
    { id: "c3", text: "완벽하지 않아도 지금 시작하면 돼.", notificationText: "지금 시작하면 돼.", style: "calm", mode: "nag", source: "ai" },
    { id: "c4", text: "전부 말고 하나만 끝내자.", notificationText: "하나만 끝내자.", style: "practical", mode: "nag", source: "ai" },
    { id: "c5", text: "미루는 건 여기까지. 지금 열자.", notificationText: "지금 열자.", style: "warm", mode: "nag", source: "ai" },
  ];

  const stubAiFetch = (mode: "praise" | "nag" = "praise") => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      decision: "ok",
      candidates: mode === "praise" ? praiseCandidates : nagCandidates,
    }), { status: 200 })));
  };

  const openRewriteWithAiCandidate = async (user: ReturnType<typeof userEvent.setup>, mode: "praise" | "nag" = "praise") => {
    stubAiFetch(mode);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));
    await user.click(screen.getByRole("button", { name: mode === "praise" ? "칭찬해줘" : "잔소리해줘" }));
    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), mode === "praise" ? "오늘 발표를 끝냈어" : "공부를 미루고 있어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));
    await user.click(await screen.findByRole("button", { name: mode === "praise" ? /오늘 발표 끝낸 건 분명히 해낸 일이야/ : /생각은 충분히 했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한마디로 계속" }));
  };

  const saveFirstLineAndOpenHome = async (user: ReturnType<typeof userEvent.setup>, rewriteText = "오늘은 할 만큼 했어.") => {
    await openRewriteWithAiCandidate(user, "praise");
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), rewriteText);
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    await user.click(screen.getByRole("button", { name: "알림 예약하고 미리보기" }));
    await screen.findByText("오늘도 나를 너무 몰아붙이지 말아요");
  };

  beforeEach(() => {
    trackedEvents.length = 0;
    scheduledNotifications.length = 0;
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders landing with v0.4 copy", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "내편한마디", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "지금 나에게 필요한 말을 만들어볼까요?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI로 한마디 만들기" })).toBeInTheDocument();
  });

  it("generates AI candidates with disclosure, labels, report, and mode buttons", async () => {
    const user = userEvent.setup();
    stubAiFetch("praise");

    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));

    expect(screen.getByRole("button", { name: "칭찬해줘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "잔소리해줘" })).toBeInTheDocument();
    expect(screen.getByText("AI가 만든 후보에는 라벨이 붙고, 불편한 문구는 바로 신고할 수 있어요.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "칭찬해줘" }));
    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "오늘 발표를 끝냈어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));

    expect(await screen.findAllByText("AI가 만든 후보")).toHaveLength(5);
    expect(window.localStorage.getItem("praise-me:state")).not.toContain("오늘 발표를 끝냈어");
    await user.click(screen.getAllByRole("button", { name: "불편한 문구 신고" })[0]!);
    expect(screen.getByText("신고했어요. 다음 후보 품질 개선에 반영할게요.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /오늘 발표 끝낸 건 분명히 해낸 일이야/ }));
    await user.click(screen.getByRole("button", { name: "이 한마디로 계속" }));

    expect(screen.getByRole("textbox")).toHaveValue("오늘 발표 끝낸 건 분명히 해낸 일이야.");
  });

  it("requests permission and schedules a real notification after AI candidate save", async () => {
    const user = userEvent.setup();
    stubAiFetch("nag");

    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));
    await user.click(screen.getByRole("button", { name: "잔소리해줘" }));
    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "공부를 미루고 있어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));
    await user.click(await screen.findByRole("button", { name: /생각은 충분히 했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한마디로 계속" }));
    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    await user.click(screen.getByRole("button", { name: "알림 예약하고 미리보기" }));

    expect(scheduledNotifications).toHaveLength(1);
    expect(scheduledNotifications[0]?.title).toBe("내편한마디");
    expect(scheduledNotifications[0]?.body).toBe("생각은 충분히 했어. 이제 5분만 시작하자.");
    expect(await screen.findByText("알림이 예약됐어요. 브라우저 또는 플랫폼 권한 상태에 따라 표시돼요.")).toBeInTheDocument();
  });

  it("adds multiple notification times and schedules each saved time", async () => {
    const user = userEvent.setup();
    await openRewriteWithAiCandidate(user, "praise");

    await user.click(screen.getByRole("button", { name: "이 문장으로 저장" }));
    expect(screen.getByText("오후 09:30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "시간 추가" }));
    expect(screen.getByRole("dialog", { name: "알림 시간 추가" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "내일 아침 08:00" }));
    await user.click(screen.getByRole("button", { name: "시간 추가하기" }));

    expect(screen.getByText("오전 08:00")).toBeInTheDocument();
    expect(screen.getByText("오후 09:30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "알림 예약하고 미리보기" }));

    expect(scheduledNotifications).toHaveLength(2);
    expect(scheduledNotifications.map((item) => item.body)).toEqual([
      "오늘 발표 끝낸 건 분명히 해낸 일이야.",
      "오늘 발표 끝낸 건 분명히 해낸 일이야.",
    ]);
    expect(await screen.findByText("알림 2개가 예약됐어요. 브라우저 또는 플랫폼 권한 상태에 따라 표시돼요.")).toBeInTheDocument();
  });

  it("emits runtime events across the actual reopen flow", async () => {
    const user = userEvent.setup();
    await openRewriteWithAiCandidate(user, "praise");
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "죽어");

    expectEventSequence(
      "landing_viewed",
      "target_confirmed",
      "ai_generation_requested",
      "ai_candidates_generated",
      "ai_candidate_selected",
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
    await saveFirstLineAndOpenHome(user);

    expectEventSequence(
      "landing_viewed",
      "target_confirmed",
      "ai_generation_requested",
      "ai_candidates_generated",
      "ai_candidate_selected",
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
    expect(screen.getByText("브라우저 알림을 지원하면 저장한 시간에 알림을 예약해요.")).toBeInTheDocument();
    expect(screen.getByText("언어")).toBeInTheDocument();
    expect(screen.queryByText("오늘도 나를 너무 몰아붙이지 말아요")).not.toBeInTheDocument();
  });

  it("persists locale and switches to English", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("heading", { name: "A Word for Me", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Make a line with AI" })).toBeInTheDocument();
    expect(window.localStorage.getItem("praise-me:locale-v1")).toBe("en");
  });

  it("blocks long free text from analytics payload", async () => {
    const user = userEvent.setup();
    const longText = "이 문장은 분석 payload에서 절대 그대로 나오면 안 되는 아주 긴 사용자 자유 입력입니다.";
    await saveFirstLineAndOpenHome(user, longText);

    // Free text should appear on screen (in preview/hero) but not in analytics
    expect(screen.getAllByText(longText).length).toBeGreaterThan(0);
    expect(JSON.stringify(trackedEvents)).not.toContain(longText);
    // Home dashboard should be visible after save
    expect(screen.getByText("오늘도 나를 너무 몰아붙이지 말아요")).toBeInTheDocument();
  });

  it("shows the caution and blocked rewrite states", async () => {
    const user = userEvent.setup();
    await openRewriteWithAiCandidate(user, "praise");
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
      "ai_generation_requested",
      "ai_candidates_generated",
      "ai_candidate_selected",
      "rewrite_started",
      "message_cautioned",
      "rewrite_saved",
    );
    expect(countEvent("message_cautioned")).toBeGreaterThanOrEqual(1);
    expect(countEvent("rewrite_saved")).toBe(1);
  });
});
