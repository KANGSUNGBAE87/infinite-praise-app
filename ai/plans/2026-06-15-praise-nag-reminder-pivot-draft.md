# 칭찬해줘/잔소리해줘 알림형 MVP 기획 초안

작성일: 2026-06-15
상태: draft
관점: Superpowers brainstorming + gstack CEO/founder review

## 한 줄 정의

`칭찬해줘/잔소리해줘`는 사용자가 원하는 말투의 메시지를 고르고,
자기가 정한 시간에 알림으로 받아보는 자기 조율 메시지 앱이다.

기존의 핵심이 `버튼을 누르면 즉시 좋은 목소리로 한마디`였다면,
이번 피벗의 핵심은 다음이다.

> 내가 정한 시간에, 내가 고른 톤으로, 지금 필요한 말을 받아본다.

## gstack CEO 판단

이 방향은 조건부로 더 좋다.

좋은 점:

- 음성 파일이 없어도 제품의 반복 사용 루프를 검증할 수 있다.
- 사용자가 직접 문구를 보고 고치기 때문에 문장 품질 리스크가 줄어든다.
- 알림은 재방문 이유를 만든다.
- `칭찬`만으로 좁았던 사용 상황을 `잔소리/리마인드/자기관리`까지 넓힌다.

위험:

- 제품 정체성이 `바로 듣는 한마디 앱`에서 `알림 문구 앱`으로 바뀐다.
- `잔소리`는 잘못 만들면 불쾌하거나 자기비난을 강화할 수 있다.
- 알림 권한, 예약, 반복 설정이 MVP를 복잡하게 만들 수 있다.
- 음성을 뒤로 미루면 원래 차별점이 약해질 수 있다.

판단:

> v0.1은 음성보다 `메시지 + 쉬운 시간 설정 + 알림`을 먼저 검증한다.
> 음성은 v0.2 이후, 사용자가 많이 저장한 메시지부터 붙인다.

## 제품 구조

### 모드 1. 칭찬해줘

용도:

- 인정받고 싶을 때
- 지쳤을 때
- 잘 버티고 있다는 말을 듣고 싶을 때

톤:

- 다정함
- 인정
- 위로
- 부담 없는 응원

예시:

- 오늘 버틴 것만으로도 잘했어.
- 지금 한 걸음이면 충분해.
- 쉬어도 네가 해온 일은 사라지지 않아.

### 모드 2. 잔소리해줘

용도:

- 미루는 일을 시작해야 할 때
- 폰을 내려놔야 할 때
- 약속한 루틴을 지켜야 할 때
- 누가 살짝 밀어줬으면 할 때

톤:

- 직설적
- 짧음
- 행동 유도
- 모욕/비난/수치심 금지

예시:

- 지금 시작 안 하면 또 밀린다. 5분만 해.
- 폰 내려. 지금은 네가 정한 시간이다.
- 완벽하게 말고, 일단 열어.
- 하기 싫은 건 알겠고, 그래도 하나만 하자.

잔소리 강도:

- `부드럽게`: 부탁형
- `정확하게`: 직설형
- `세게`: 강한 리마인드

MVP에서는 `정확하게`를 기본으로 두고, `세게`는 문구 검수 후 추가한다.

### 모드 3. 내가 원하는 메시지

용도:

- 사용자가 직접 받을 말을 입력한다.
- 기존 문구를 수정해서 자기 말투로 만든다.
- 특정 목표나 루틴에 맞는 문장을 저장한다.

MVP 범위:

- 메시지 직접 입력
- 기존 메시지 복사 후 수정
- 카테고리 선택
- 알림 시간 연결

MVP 제외:

- AI 문장 생성
- 실시간 TTS
- 계정 동기화
- 공유 템플릿 마켓

## MVP 핵심 흐름

### 첫 사용 흐름

1. 사용자가 모드를 고른다.
   - `칭찬해줘`
   - `잔소리해줘`
   - `내가 쓸게`
2. 메시지 후보를 본다.
3. 마음에 드는 메시지를 선택하거나 수정한다.
4. 알림 시간을 고른다.
5. 저장한다.
6. 정해진 시간에 알림이 온다.
7. 알림을 탭하면 앱에서 해당 메시지를 다시 보여준다.

### 반복 사용 흐름

1. 오늘 받은 메시지를 본다.
2. `좋았어`, `별로야`, `수정하기` 중 하나를 선택한다.
3. 좋았던 메시지는 계속 사용한다.
4. 별로인 메시지는 교체한다.
5. 필요하면 시간을 바꾼다.

## 시간 설정 UX

핵심 원칙:

- 사용자가 cron처럼 느끼면 실패다.
- “언제 받을지”를 자연어에 가깝게 고르게 한다.
- 처음 설정은 10초 안에 끝나야 한다.

### 추천 UI

1. 빠른 프리셋
   - 아침 시작
   - 점심 전
   - 오후 늘어질 때
   - 퇴근 전
   - 자기 전

2. 반복 선택
   - 매일
   - 평일
   - 주말
   - 요일 직접 선택

3. 시간 조정
   - 프리셋 시간 표시
   - `-10분`, `+10분` 버튼
   - 직접 시간 선택

### 예시

- `평일 오전 8:30`
- `매일 오후 2:00`
- `월/수/금 밤 11:00`

## 알림 정책

MVP 알림은 텍스트만 보낸다.

하지 않을 것:

- 알림 도착 즉시 자동 음성 재생
- 백그라운드 자동 TTS
- 긴 메시지 알림
- 하루에 너무 많은 알림

권장:

- 알림 제목: 짧게
- 알림 본문: 선택한 메시지
- 탭 동작: 앱 열기 + 메시지 상세 표시

## 데이터 구조 초안

```ts
type MessageMode = "praise" | "nag" | "custom";

type MessageTone = "soft" | "direct" | "strong";

type MessageTemplate = {
  id: string;
  mode: MessageMode;
  category: string;
  displayText: string;
  notificationText: string;
  tone: MessageTone;
  riskLevel: "low" | "medium" | "high";
};

type CustomMessage = {
  id: string;
  sourceTemplateId?: string;
  mode: MessageMode;
  displayText: string;
  notificationText: string;
  tone: MessageTone;
  createdAt: number;
  updatedAt: number;
};

type ReminderSchedule = {
  id: string;
  messageId: string;
  repeat: "daily" | "weekdays" | "weekends" | "customDays";
  daysOfWeek?: number[];
  hour: number;
  minute: number;
  enabled: boolean;
};
```

## 어댑터 구조

현재 `src/platform/adapters.ts`에는 로그인/결제/광고 stub이 있다.
이 피벗에서는 알림도 platform adapter로 분리해야 한다.

추가 후보:

```ts
type NotificationPermission = "unknown" | "granted" | "denied";

type NotificationAdapter = {
  status: "stub" | "enabled";
  getPermission(): Promise<NotificationPermission>;
  requestPermission(): Promise<NotificationPermission>;
  scheduleReminder(reminder: ReminderSchedule): Promise<{ scheduled: boolean; reason?: string }>;
  cancelReminder(reminderId: string): Promise<void>;
};
```

플랫폼별 확장:

- Apps in Toss: Toss 환경 알림 정책 확인 필요
- Google Play: Android notification permission + local notification scheduling
- Web: 브라우저/탭 제약으로 MVP 검증용만 가능

## v0.1 범위

필수:

- `칭찬해줘` / `잔소리해줘` 모드
- 모드별 기본 메시지 10개씩
- 사용자 직접 메시지 1개 이상 저장
- 빠른 시간 설정
- reminder 저장
- 알림 adapter stub
- 실제 알림이 안 되는 환경에서는 “예약됨” 상태와 테스트 알림 미리보기

제외:

- 실제 음성
- 실시간 TTS
- AI 생성
- 계정
- 결제
- 광고 노출
- 메시지 공유
- 서버 동기화

## v0.2 후보

- 실제 로컬 알림 구현
- 좋았어/별로야 반응
- 메시지별 성과 기록
- 잔소리 강도 조절
- 음성 미리듣기
- 많이 저장한 메시지부터 오디오 생성
- 유료 메시지 pack 준비

## v0.3 후보

- 프리미엄 음성 pack
- 루틴별 pack
- 집중/운동/수면/공부/출근 pack
- 계정 동기화
- 결제
- 광고 제거

## 제품명 판단

`칭찬해줘` 안에 `잔소리해줘`가 들어오면 이름과 기능 사이에 약간의 긴장이 생긴다.

선택지:

1. 앱명은 `칭찬해줘` 유지
   - 장점: 기존 흐름 유지
   - 단점: 잔소리 모드가 이름과 어긋남

2. 상위 앱명을 새로 잡고 내부 버튼을 `칭찬해줘/잔소리해줘`로 둠
   - 장점: 확장성이 좋음
   - 단점: 기존 이름 자산을 버림

3. 앱명은 일단 `칭찬해줘` 유지, 스토어 카피에서 `내가 정한 시간에 듣는 칭찬과 잔소리`로 확장
   - 장점: MVP에서 가장 빠름
   - 단점: 장기적으로 리브랜딩 가능성 있음

추천:

> v0.1은 `칭찬해줘` 유지. 내부 탭을 `칭찬` / `잔소리` / `직접 쓰기`로 둔다.
> 잔소리 기능 사용률이 높으면 v0.2 이후 상위 이름을 다시 검토한다.

## 최종 초안 verdict

이 피벗은 음성-first보다 검증이 빠르다.

추천 MVP:

1. 음성은 잠시 뒤로 미룬다.
2. `칭찬/잔소리/직접 쓰기` 메시지 선택을 만든다.
3. 시간을 쉽게 고르게 한다.
4. 알림 예약 구조를 만든다.
5. 실제 알림은 platform adapter로 분리한다.
6. 사용자가 저장/반복하는 메시지가 확인되면 그 메시지부터 음성을 붙인다.
