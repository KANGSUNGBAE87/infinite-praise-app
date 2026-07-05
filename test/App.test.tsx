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
    { id: "c1", text: "오늘 발표 끝낸 건 분명히 해낸 일이야.", notificationText: "발표 끝낸 너, 오늘 해냈어.", expressionVariant: "short_sentence", mode: "praise", source: "ai" },
    { id: "c2", text: "긴장했어도 끝까지 간 네가 멋져.", notificationText: "끝까지 간 네가 멋져.", expressionVariant: "action_suggestion", mode: "praise", source: "ai" },
    { id: "c3", text: "완벽하지 않아도 마친 건 사라지지 않아.", notificationText: "마친 건 사라지지 않아.", expressionVariant: "ack_then_act", mode: "praise", source: "ai" },
    { id: "c4", text: "오늘은 스스로에게 잘했다고 해도 돼.", notificationText: "스스로에게 잘했다고 해도 돼.", expressionVariant: "notification_short", mode: "praise", source: "ai" },
    { id: "c5", text: "발표를 마친 너는 이미 한 고비를 넘었어.", notificationText: "한 고비를 넘었어.", expressionVariant: "firmer_line", mode: "praise", source: "ai" },
  ];

  const nagCandidates = [
    { id: "c1", text: "생각은 충분히 했어. 이제 5분만 시작하자.", notificationText: "이제 5분만 시작하자.", expressionVariant: "short_sentence", mode: "nag", source: "ai" },
    { id: "c2", text: "폰은 내려두고 지금 첫 단계만 하자.", notificationText: "첫 단계만 하자.", expressionVariant: "action_suggestion", mode: "nag", source: "ai" },
    { id: "c3", text: "완벽하지 않아도 지금 시작하면 돼.", notificationText: "지금 시작하면 돼.", expressionVariant: "ack_then_act", mode: "nag", source: "ai" },
    { id: "c4", text: "전부 말고 하나만 끝내자.", notificationText: "하나만 끝내자.", expressionVariant: "notification_short", mode: "nag", source: "ai" },
    { id: "c5", text: "미루는 건 여기까지. 지금 열자.", notificationText: "지금 열자.", expressionVariant: "firmer_line", mode: "nag", source: "ai" },
  ];

  const stubAiFetch = (mode: "praise" | "nag" = "praise") => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url, init) => {
      const body = JSON.parse(String(init?.body ?? "{}"));
      return new Response(JSON.stringify({
        decision: "ok",
        constraintBundle: body.constraintBundle,
        candidates: mode === "praise" ? praiseCandidates : nagCandidates,
      }), { status: 200 });
    }));
  };

  const chooseAxisOption = async (user: ReturnType<typeof userEvent.setup>, axisLabel: string, optionLabel: string) => {
    await user.click(screen.getByRole("button", { name: new RegExp(axisLabel) }));
    expect(screen.getByRole("dialog", { name: `${axisLabel} 고르기` })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: optionLabel }));
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
    await user.click(screen.getByRole("button", { name: "알림 시간 정하기" }));
    await user.click(screen.getByRole("button", { name: "이 문장으로 최종 저장" }));
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
    expect(screen.queryByRole("button", { name: "뒤로" })).not.toBeInTheDocument();
  });

  it("shows a top-left back button after leaving landing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));

    const backButton = screen.getByRole("button", { name: "뒤로" });
    expect(backButton).toHaveClass("top-back-button");
    expect(screen.getByRole("button", { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /보관함/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /설정/ })).toBeInTheDocument();

    await user.click(backButton);

    expect(screen.getByRole("heading", { name: "지금 나에게 필요한 말을 만들어볼까요?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "뒤로" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /보관함/ })).not.toBeInTheDocument();
  });

  it("generates AI candidates with disclosure, labels, report, and mode buttons", async () => {
    const user = userEvent.setup();
    stubAiFetch("nag");

    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));

    expect(screen.getByRole("button", { name: "칭찬해줘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "잔소리해줘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "직접 쓸게" })).toBeInTheDocument();
    expect(screen.getByText("입력 내용은 AI 처리를 위해 서버로 전송될 수 있고, 이름·연락처·건강정보는 보내지 않도록 마스킹해요.")).toBeInTheDocument();
    expect(screen.getByText("상황")).toBeInTheDocument();
    expect(screen.getByText("감정")).toBeInTheDocument();
    expect(screen.getByText("톤")).toBeInTheDocument();
    expect(screen.getByText("강도")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /상황.*해낸 일/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /감정.*지침/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "공부" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "잔소리해줘" }));
    expect(screen.getByRole("button", { name: /상황.*공부 시작/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /감정.*미루는 중/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "해낸 일" })).not.toBeInTheDocument();

    await chooseAxisOption(user, "상황", "운동 가기");
    await chooseAxisOption(user, "감정", "미루는 중");
    await chooseAxisOption(user, "톤", "차분하게");
    await chooseAxisOption(user, "강도", "정확히 짚기");
    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "오늘 헬스장 못 가겠어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));

    expect(await screen.findAllByText("AI가 만든 후보")).toHaveLength(5);
    expect(screen.getByText("짧은 한마디")).toBeInTheDocument();
    expect(screen.getByText("행동 제안형")).toBeInTheDocument();
    expect(screen.getByText("인정 후 제안형")).toBeInTheDocument();
    expect(screen.getByText("알림용 한 줄")).toBeInTheDocument();
    expect(screen.getByText("단호 정리형")).toBeInTheDocument();
    const fetchBody = JSON.parse(String((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.body));
    expect(fetchBody.situation).toBe("exercise");
    expect(fetchBody.feeling).toBe("procrastinating");
    expect(fetchBody.tone).toBe("calm");
    expect(fetchBody.intensity).toBe("firm");
    expect(fetchBody.constraintBundle).toMatchObject({
      mode: "nag",
      locale: "ko",
      situation: "exercise",
      feeling: "procrastinating",
      tone: "calm",
      intensity: "firm",
    });
    expect(window.localStorage.getItem("praise-me:state")).not.toContain("오늘 헬스장 못 가겠어");
    await user.click(screen.getAllByRole("button", { name: "불편한 문구 신고" })[0]!);
    expect(screen.getByText("신고했어요. 이 기기에서는 해당 후보를 건너뛰고, 서버 신고 연결 전까지는 원문을 저장하지 않아요.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /생각은 충분히 했어/ }));
    await user.click(screen.getByRole("button", { name: "이 한마디로 계속" }));

    expect(screen.getByRole("textbox")).toHaveValue("생각은 충분히 했어. 이제 5분만 시작하자.");
  });

  it("closes the axis picker with Escape after moving focus into the sheet", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));
    await user.click(screen.getByRole("button", { name: /상황.*해낸 일/ }));

    const dialog = screen.getByRole("dialog", { name: "상황 고르기" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toContainElement(document.activeElement as HTMLElement | null);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "상황 고르기" })).not.toBeInTheDocument();
  });

  it("lets the user write a direct line without AI generation and blocks unsafe direct copy", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI로 한마디 만들기" }));
    await user.click(screen.getByRole("button", { name: "직접 쓸게" }));

    expect(screen.getByText("내가 받을 말을 직접 쓸게요.")).toBeInTheDocument();
    expect(screen.queryByText("입력 내용은 AI 처리를 위해 서버로 전송될 수 있고, 이름·연락처·건강정보는 보내지 않도록 마스킹해요.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 문장으로 시간 정하기" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "직접 받을 문장을 적어주세요" }), "퇴근하면 바로 운동복 입기.");
    await user.click(screen.getByRole("button", { name: "이 문장으로 시간 정하기" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "다시 보고 싶은 시간을 정해보세요" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "뒤로" }));
    await user.clear(screen.getByRole("textbox", { name: "직접 받을 문장을 적어주세요" }));
    await user.type(screen.getByRole("textbox", { name: "직접 받을 문장을 적어주세요" }), "한심하게 굴지 마");

    expect(screen.getByText("이 문구는 저장할 수 없어요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 문장으로 시간 정하기" })).toBeDisabled();
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
    await user.click(screen.getByRole("button", { name: "알림 시간 정하기" }));
    await user.click(screen.getByRole("button", { name: "이 문장으로 최종 저장" }));

    expect(scheduledNotifications).toHaveLength(1);
    expect(scheduledNotifications[0]?.title).toBe("내편한마디");
    expect(scheduledNotifications[0]?.body).toBe("생각은 충분히 했어. 이제 5분만 시작하자.");
    expect(await screen.findByText("알림이 예약됐어요. 브라우저 또는 플랫폼 권한 상태에 따라 표시돼요.")).toBeInTheDocument();
  });

  it("adds multiple notification times and schedules each saved time", async () => {
    const user = userEvent.setup();
    await openRewriteWithAiCandidate(user, "praise");

    await user.click(screen.getByRole("button", { name: "알림 시간 정하기" }));
    expect(screen.getByText("오후 09:30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "시간 추가" }));
    expect(screen.getByRole("dialog", { name: "알림 시간 추가" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "내일 아침 08:00" }));
    await user.click(screen.getByRole("button", { name: "시간 추가하기" }));

    expect(screen.getByText("오전 08:00")).toBeInTheDocument();
    expect(screen.getByText("오후 09:30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "이 문장으로 최종 저장" }));

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
    expect(screen.getByRole("button", { name: "알림 시간 정하기" })).toBeDisabled();
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
    expect(screen.getByText("오늘은 할 만큼 했어.")).toBeInTheDocument();
    expect(screen.getByText("1개의 한 줄")).toBeInTheDocument();
    expect(screen.queryByText(/아직 보관한 한 줄이 없어요/)).not.toBeInTheDocument();
  });

  it("keeps bottom tabs visible while changing the saved line", async () => {
    const user = userEvent.setup();
    await saveFirstLineAndOpenHome(user);

    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));

    expect(screen.getByRole("heading", { name: "칭찬해줘 / 잔소리해줘 / 직접 쓸게" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /보관함/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /설정/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /홈/ }));

    expect(screen.getByText("오늘도 나를 너무 몰아붙이지 말아요")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "칭찬해줘 / 잔소리해줘 / 직접 쓸게" })).not.toBeInTheDocument();
  });

  it("keeps a newly edited line pending instead of jumping back to the old home card", async () => {
    const user = userEvent.setup();
    await saveFirstLineAndOpenHome(user, "기존 저장 문장");

    stubAiFetch("praise");
    await user.click(screen.getByRole("button", { name: "오늘의 한 줄 고르기" }));
    await user.type(screen.getByRole("textbox", { name: "상황이나 해야 할 일을 짧게 적어주세요" }), "오늘은 쉬고 싶어");
    await user.click(screen.getByRole("button", { name: "AI 후보 5개 만들기" }));
    await user.click(await screen.findByRole("button", { name: /오늘 발표 끝낸 건 분명히 해낸 일이야/ }));
    await user.click(screen.getByRole("button", { name: "이 한마디로 계속" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "새로 저장할 문장");
    await user.click(screen.getByRole("button", { name: "알림 시간 정하기" }));

    expect(screen.getByRole("heading", { name: "다시 보고 싶은 시간을 정해보세요" })).toBeInTheDocument();
    expect(screen.getByText("새로 저장할 문장")).toBeInTheDocument();
    expect(screen.queryByText("기존 저장 문장")).not.toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "알림 시간 정하기" })).toBeEnabled();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "죽어");
    expect(screen.getByText("이 문구는 저장할 수 없어요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "알림 시간 정하기" })).toBeDisabled();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "넌 왜 맨날 이러냐");
    await user.click(screen.getByRole("button", { name: "알림 시간 정하기" }));
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
