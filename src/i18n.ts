export const localeOptions = [
  { id: "ko", label: "한국어" },
  { id: "en", label: "English" },
] as const;

export type Locale = (typeof localeOptions)[number]["id"];

const messages = {
  ko: {
    "settings.language": "언어",
    "app.aria": "칭찬해줘",
    "app.title": "칭찬해줘",
    "app.subtitle": "하루 한 줄, 나를 덜 가혹하게 마무리해요",
    "app.description": "하루에 한 줄만, 내 편이 되어보세요.",
    "app.offline": "오프라인에서는 저장된 한 줄만 볼 수 있어요.",
    "navigation.progress": "{current}/{total} 단계",
    "navigation.back": "뒤로",
    "navigation.next": "다음",
    "navigation.restart": "처음부터",
    "navigation.preview": "미리보기",

    "progress.start": "시작",
    "progress.choose": "선택",
    "progress.edit": "수정",
    "progress.save": "저장",
    "progress.check": "확인",
    "progress.done": "완료",

    /* ── Landing (Screen 1) ── */
    "landing.title": "오늘을 조금 덜 가혹하게 마무리해볼까요?",
    "landing.body": "하루에 한 줄만, 내 편이 되어보세요.",
    "landing.confirm": "오늘의 한 줄 고르기",
    "landing.reject": "지금은 아니에요",
    "landing.retry": "다시 불러오기",
    "landing.offlineHint": "예시 한 줄만 먼저 읽어볼 수 있어요.",

    /* ── Praise pick (Screen 2) ── */
    "praise.title": "오늘의 한 줄",
    "praise.body": "하나를 고르면 비슷한 결의 한 줄을 보여드려요.",
    "praise.select": "선택하기",
    "praise.selected": "선택됨",
    "praise.continue": "이 한 줄로 할게요",
    "praise.reveal": "다른 한 줄 더 보기",

    /* ── Emotions ── */
    "emotion.title": "지금 어떤 말이 필요해요?",
    "emotion.e1": "잘 버텼어",
    "emotion.e1desc": "오늘을 인정받고 싶을 때",
    "emotion.e2": "잠깐 쉬어",
    "emotion.e2desc": "마음을 조금 내려놓고 싶을 때",
    "emotion.e3": "다시 해보자",
    "emotion.e3desc": "작게라도 움직이고 싶을 때",
    "emotion.e4": "괜찮아",
    "emotion.e4desc": "실수한 나를 놓아주고 싶을 때",

    /* ── Rewrite (Screen 3) ── */
    "rewrite.title": "원하면 내 말로 조금 바꿔요",
    "rewrite.body": "짧게만 수정해도 충분해요.",
    "rewrite.placeholder": "예: 오늘은 할 만큼 했어.",
    "rewrite.keepOriginal": "원래 문장으로 돌아가기",
    "rewrite.save": "이 문장으로 저장",
    "rewrite.caution": "이 문구는 조금 더 다정하게 바꿔도 좋아요.",
    "rewrite.blocked": "이 문구는 저장할 수 없어요.",

    /* ── Time save (Screen 4) ── */
    "schedule.title": "다시 보고 싶은 시간을 정해보세요",
    "schedule.body": "앱 안에서 미리보기로 저장돼요.",
    "schedule.label": "받을 시간",
    "schedule.preview": "저장 직후 미리보기",
    "schedule.save": "시간 저장",
    "schedule.savePreview": "저장하고 미리보기",
    "schedule.previewBadge": "내일의 나에게",
    "schedule.previewNote": "실제 알림이 아닌 미리보기로 저장돼요.",
    "schedule.previewOnly": "미리보기 전용",
    "preview.fallback": "내일의 나에게 남기는 한 줄",

    /* ── Home dashboard (Screen 5) ── */
    "home.headline": "오늘도 나를 너무 몰아붙이지 말아요",
    "home.support": "하루에 한 줄만, 내 편이 되어보세요.",
    "home.heroLabel": "오늘의 한 줄",
    "home.heroLine": "오늘 밤 {time}에 다시 만나요",
    "home.heroChange": "한 줄 바꾸기",
    "home.emotionTitle": "지금 내게 필요한 말",
    "home.emotionCaption": "느낌을 고르면 한 줄을 바로 추천해요.",
    "home.pickCta": "오늘의 한 줄 고르기",
    "home.weeklyTitle": "나를 챙긴 기록",
    "home.weeklySummary": "이번 주 {count}번, 내 편이 되어줬어요",

    /* ── Check-in (Screen 5 reopened) ── */
    "checkin.title": "어제의 한 줄, 오늘은 어땠어요?",
    "checkin.body": "정답은 없어요. 지금 느낌에 가까운 걸 골라주세요.",
    "checkin.keep": "도움됐어",
    "checkin.keepSub": "이 한 줄을 보관함에 넣을게요",
    "checkin.edit": "그냥 그랬어",
    "checkin.editSub": "내일은 다른 결의 말을 골라볼게요",
    "checkin.skip": "오늘은 바꿀래",
    "checkin.skipSub": "지금 필요한 말로 새로 고를게요",
    "checkin.tag": "왜 다시 열었나요?",
    "checkin.yesterdayLabel": "어제의 한 줄",
    "checkin.yesterdaySaved": "어젯밤 {time}에 저장했어요",

    "reopen.manual": "직접 다시 열었어요",
    "reopen.notification": "알림을 눌렀어요",
    "reopen.unknown": "알림 또는 직접 다시 열었어요",

    /* ── Result (Screen 6) ── */
    "result.title": "확인 완료",
    "result.summaryKeep": "도움이 되었다니 다행이에요. 보관함에 넣어둘게요.",
    "result.summaryEdit": "내일은 다른 결의 말을 골라볼게요.",
    "result.summarySkip": "오늘은 새로 한 줄을 골라볼게요.",
    "result.body": "D1 복귀자에게만 조심스럽게 보이는 관심 슬롯이에요.",
    "result.cta": "마음에 든 한 줄 보관함 보기",
    "result.dismiss": "관심 없음",
    "result.register": "관심 등록",
    "result.hidden": "첫 세션에서는 숨겨져요.",
    "result.notice": "가격, 결제, 할인 문구는 보여주지 않아요.",

    /* ── Vault (보관함) ── */
    "vault.title": "보관함",
    "vault.empty": "아직 보관한 한 줄이 없어요.\n도움이 된 문장은 보관함에 쌓여요.",
    "vault.delete": "삭제",
    "vault.reuse": "오늘의 한 줄로",
    "vault.count": "{count}개의 한 줄",

    /* ── Weekly care ── */
    "weekly.mon": "월",
    "weekly.tue": "화",
    "weekly.wed": "수",
    "weekly.thu": "목",
    "weekly.fri": "금",
    "weekly.sat": "토",
    "weekly.sun": "일",

    /* ── Navigation ── */
	    "nav.home": "홈",
	    "nav.vault": "보관함",
	    "nav.settings": "설정",

	    /* ── Settings ── */
	    "settings.title": "설정",
	    "settings.notificationTitle": "알림",
	    "settings.notificationStatus": "현재는 앱 안 미리보기만 저장돼요.",
	    "settings.notificationBody": "실제 알림을 붙일 때는 권한 동의, 문구 검수, 데이터 선언을 다시 확인해야 해요.",
	    "settings.savedTime": "저장된 시간",
	    "settings.languageBody": "앱에서 볼 언어를 고를 수 있어요.",

	    /* ── Status ── */
	    "status.loading": "불러오는 중",
    "status.error": "문제가 생겼어요. 다시 시도해 주세요.",
    "status.empty": "아직 저장된 내용이 없어요.",
    "status.saved": "저장했어요.",
    "status.previewOnly": "미리보기 전용으로 표시 중이에요.",
  },
  en: {
    "settings.language": "Language",
    "app.aria": "Praise Me",
    "app.title": "Praise Me",
    "app.subtitle": "One line a day, be a little kinder to yourself.",
    "app.description": "One line a day. Be on your own side.",
    "app.offline": "Offline mode shows only the saved line.",
    "navigation.progress": "Step {current} of {total}",
    "navigation.back": "Back",
    "navigation.next": "Next",
    "navigation.restart": "Start over",
    "navigation.preview": "Preview",

    "progress.start": "Start",
    "progress.choose": "Choose",
    "progress.edit": "Edit",
    "progress.save": "Save",
    "progress.check": "Check",
    "progress.done": "Done",

    /* ── Landing ── */
    "landing.title": "Want to end today a little less harshly?",
    "landing.body": "One line a day. Be on your own side.",
    "landing.confirm": "Pick today's line",
    "landing.reject": "Not now",
    "landing.retry": "Reload",
    "landing.offlineHint": "You can read one example line first.",

    /* ── Praise pick ── */
    "praise.title": "Today's line",
    "praise.body": "Pick your mood and we'll suggest a matching line.",
    "praise.select": "Select",
    "praise.selected": "Selected",
    "praise.continue": "I'll go with this one",
    "praise.reveal": "Show one more line",

    /* ── Emotions ── */
    "emotion.title": "What kind of words do you need right now?",
    "emotion.e1": "I held on",
    "emotion.e1desc": "When you want to be acknowledged",
    "emotion.e2": "I need a break",
    "emotion.e2desc": "When you need to let go a little",
    "emotion.e3": "Let me try again",
    "emotion.e3desc": "When you want to move, even a little",
    "emotion.e4": "It's okay",
    "emotion.e4desc": "When you need to forgive yourself",

    /* ── Rewrite ── */
    "rewrite.title": "Want to make it yours?",
    "rewrite.body": "A tiny edit is enough.",
    "rewrite.placeholder": "e.g. I did enough today.",
    "rewrite.keepOriginal": "Go back to original",
    "rewrite.save": "Save this version",
    "rewrite.caution": "This line could be a little gentler.",
    "rewrite.blocked": "This line cannot be saved.",

    /* ── Time save ── */
    "schedule.title": "When do you want to revisit this?",
    "schedule.body": "Saved as a preview inside the app.",
    "schedule.label": "Time",
    "schedule.preview": "Preview after save",
    "schedule.save": "Save time",
    "schedule.savePreview": "Save & Preview",
    "schedule.previewBadge": "For tomorrow's self",
    "schedule.previewNote": "Saved as a preview — no real notification yet.",
    "schedule.previewOnly": "Preview only",
    "preview.fallback": "One line kept for tomorrow",

    /* ── Home dashboard ── */
    "home.headline": "Don't be too hard on yourself today.",
    "home.support": "One line a day. Be on your own side.",
    "home.heroLabel": "Today's line",
    "home.heroLine": "See you tonight at {time}",
    "home.heroChange": "Change line",
    "home.emotionTitle": "What I need right now",
    "home.emotionCaption": "Pick a mood, and we'll find the right line.",
    "home.pickCta": "Pick today's line",
    "home.weeklyTitle": "Days I was kind to myself",
    "home.weeklySummary": "{count} time(s) this week, you were on your own side",

    /* ── Check-in ── */
    "checkin.title": "Yesterday's line — how was it?",
    "checkin.body": "No right answer. Pick what feels closest.",
    "checkin.keep": "It helped",
    "checkin.keepSub": "I'll save this to my vault",
    "checkin.edit": "It was okay",
    "checkin.editSub": "Tomorrow let's try a different mood",
    "checkin.skip": "Change it today",
    "checkin.skipSub": "I'll pick a new line for now",
    "checkin.tag": "Why did you reopen?",
    "checkin.yesterdayLabel": "Yesterday's line",
    "checkin.yesterdaySaved": "Saved last night at {time}",

    "reopen.manual": "Opened manually",
    "reopen.notification": "Opened from a notification",
    "reopen.unknown": "Opened from a notification or manually",

    /* ── Result ── */
    "result.title": "Check-in done",
    "result.summaryKeep": "Glad it helped! I've saved it to your vault.",
    "result.summaryEdit": "Tomorrow we'll try a different mood.",
    "result.summarySkip": "Let's pick a fresh line for today.",
    "result.body": "A gentle interest slot appears only for D1 returners.",
    "result.cta": "See the favorite-line vault",
    "result.dismiss": "Not interested",
    "result.register": "Register interest",
    "result.hidden": "Hidden on the first session.",
    "result.notice": "No price, payment, or discount copy is shown.",

    /* ── Vault ── */
    "vault.title": "Vault",
    "vault.empty": "No saved lines yet.\nLines that helped will collect here.",
    "vault.delete": "Delete",
    "vault.reuse": "Use today",
    "vault.count": "{count} lines saved",

    /* ── Weekly care ── */
    "weekly.mon": "Mon",
    "weekly.tue": "Tue",
    "weekly.wed": "Wed",
    "weekly.thu": "Thu",
    "weekly.fri": "Fri",
    "weekly.sat": "Sat",
    "weekly.sun": "Sun",

    /* ── Navigation ── */
	    "nav.home": "Home",
	    "nav.vault": "Vault",
	    "nav.settings": "Settings",

	    /* ── Settings ── */
	    "settings.title": "Settings",
	    "settings.notificationTitle": "Notifications",
	    "settings.notificationStatus": "Only in-app previews are saved for now.",
	    "settings.notificationBody": "Before real notifications, permission consent, copy review, and data declarations need another pass.",
	    "settings.savedTime": "Saved time",
	    "settings.languageBody": "Choose the language shown in the app.",

	    /* ── Status ── */
	    "status.loading": "Loading",
    "status.error": "Something went wrong. Please try again.",
    "status.empty": "Nothing saved yet.",
    "status.saved": "Saved.",
    "status.previewOnly": "Shown as preview only.",
  },
} as const;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ko" || value === "en";
}

export function createI18n(locale: Locale): any {
  const dict = messages[locale];
  return {
    locale,
    t(key: string, vars?: Record<string, string | number>) {
      let text: string = String(dict[key as keyof typeof dict] ?? key);
      if (vars) {
        for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
      }
      return text;
    },
  };
}
