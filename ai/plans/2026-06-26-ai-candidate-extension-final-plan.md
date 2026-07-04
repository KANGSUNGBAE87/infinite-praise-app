---
version: v0.5-final-addition
status: final-additional-plan
updated: 2026-06-26
canonical: false
project: 칭찬해줘
english_name: Praise Me
candidate_english_name: One Line for Me
topic: AI 후보 선택형 확장 최종 추가기획안
---

# AI 후보 선택형 확장 최종 추가기획안

## 1. 최종 판단

기존 앱을 버리고 다시 만들 필요는 없다.

현재 `칭찬해줘`는 6-screen local-first 흐름, 문구 선택, 선택적 수정, 시간 저장 미리보기, 다음 방문 체크인, 보관함, 설정까지 이미 제품의 뼈대가 있다. 첨부안의 방향처럼 `ReminderApp`을 통째로 다시 켜는 것보다 현재 활성 `App.tsx` 흐름에 모드와 후보 생성 경험을 흡수하는 편이 맞다.

다만 첨부안의 `AI 후보 생성 검증`을 바로 첫 슬라이스로 두는 것은 과하다. DeepSeek 같은 외부 AI를 붙이는 순간 서버 프록시, 외부 전송 고지, AI 라벨, 인앱 신고, 안전 차단, 개인정보 고지, Apps in Toss/Google Play 재검토가 함께 들어온다.

따라서 최종 추가기획은 다음 순서로 확정한다.

```text
v0.5a  비AI 모드 확장
v0.5b  보관함/재사용 UX 강화
v0.6   선택형 AI 후보 생성 베타
v0.7   실제 알림 검토
```

핵심 원칙은 하나다.

> AI가 앱의 본체가 아니라, 사용자가 고를 한마디 후보를 보조로 제안한다.

## 2. 이름과 포지셔닝

단기 공개명은 `칭찬해줘`를 유지한다. 현재 canonical 기획과 구현, 사용자 기대가 모두 이 이름에 맞춰져 있고, 지금 정식 리브랜딩을 하면 검증보다 혼란이 크다.

다만 앱 내부 카피는 기능 범위를 넓힌다.

```text
앱명: 칭찬해줘
서브카피: 칭찬도 잔소리도, 지금 나에게 맞게
내부 모드: 칭찬해줘 / 살짝 밀어줘 / 직접 쓸게
영문 현재명: Praise Me
영문 확장 작업명: One Line for Me
```

`한마디 해줘`는 v0.6 이후 리브랜딩 후보로 보류한다. 잔소리 모드와 직접쓰기 사용률이 충분히 높고, 앱이 칭찬보다 넓은 "자기조율 한마디" 앱으로 검증되면 그때 정식 전환한다.

## 3. 무엇을 받아들이고 무엇을 수정할지

첨부안에서 채택할 것:

- 기존 앱을 폐기하지 않고 현재 활성 흐름을 확장한다.
- AI는 상담, 진단, 성격 판단이 아니라 문구 후보 생성으로 제한한다.
- 후보는 5개로 만들고 사용자가 직접 선택/수정한 문장만 저장한다.
- 잔소리는 사람 공격이 아니라 행동을 밀어주는 문구로 제한한다.
- DeepSeek/API 키는 프런트에 넣지 않고 서버 프록시 뒤에 둔다.
- AI 도입 시 AI 고지, AI 라벨, 신고, 안전 차단을 필수로 둔다.

첨부안에서 수정할 것:

- 앱명을 지금 바로 `한마디 해줘`로 바꾸지 않는다.
- AI 후보 생성을 v0.5a 첫 작업으로 두지 않는다.
- 실제 알림을 AI 검증과 동시에 붙이지 않는다.
- `잔소리해줘`를 첫 진입의 강한 브랜드로 밀기보다 `살짝 밀어줘` 같은 부드러운 모드명으로 테스트한다.
- 생성된 후보 전체와 사용자 원문을 영구 저장하거나 analytics에 넣지 않는다.

## 4. 단계별 제품 기획

### v0.5a: 비AI 모드 확장

목표:

현재 6-screen 흐름을 유지하면서 사용자가 직접 칭찬/행동 리마인드/직접쓰기 중 원하는 결을 고르게 한다.

범위:

- `칭찬해줘`
- `살짝 밀어줘`
- `직접 쓸게`
- 기존 수정 화면 재사용
- 기존 시간 저장과 미리보기 유지
- 실제 알림은 계속 `preview_only`
- 기존 보관함/체크인 흐름 유지

문구 데이터:

- 칭찬은 현재 release praise 후보를 유지한다.
- 행동 리마인드는 `message-templates.v0.1.json`의 `nag-soft`, `nag-direct` 후보를 사용한다.
- `strong` 잔소리는 넣지 않는다.

성공 기준:

- 사용자가 첫 화면에서 "칭찬 앱인데 잔소리도 되는구나"를 이해한다.
- 첫 한마디 저장까지 60초 이내를 유지한다.
- `preview_only`인데 실제 알림처럼 오해시키지 않는다.

### v0.5b: 보관함/재사용 UX 강화

목표:

보관함을 죽은 메뉴가 아니라 재방문 이유로 만든다.

범위:

- 보관함 empty state 개선
- `도움됐어` 문장 자동 보관
- 보관 문구 재사용
- 보관 문구 삭제
- 문구 출처 표시: `칭찬`, `살짝 밀어줘`, `직접 작성`
- 오늘 다시 쓰기 CTA

성공 기준:

- 빈 보관함에서도 사용자가 "어떻게 채우는지" 안다.
- 도움이 된 문장을 다시 선택하는 경로가 2탭 이내다.
- 보관함이 설정/기록 메뉴처럼 보이지 않고 감정적 보상으로 작동한다.

### v0.6: 선택형 AI 후보 생성 베타

목표:

AI를 기본 경로가 아니라 선택형 실험 경로로 붙인다. 사용자가 동의하면 상황/해야 할 일을 짧게 입력하고, AI가 서로 다른 결의 후보 5개를 제안한다.

기본 흐름:

```text
모드 선택
→ 상황 또는 해야 할 일 입력
→ AI 후보 5개 생성
→ 사용자가 하나 선택
→ 직접 수정
→ 공통 안전검사
→ 시간 저장 미리보기
→ 다음 방문 체크인
```

후보 스타일:

- 다정하게
- 짧고 명확하게
- 현실적으로
- 차분하게
- 직접적으로

필수 UX:

- 첫 사용 전 AI 사용 고지
- `기본 문구만 사용` 대안
- 후보 카드의 `AI가 만든 후보` 라벨
- `불편한 문구 신고` 액션
- loading, fallback, blocked, error 상태
- 자해/자살/폭력/의료 진단 요청 감지 시 일반 생성 중단

기술 경계:

- `MessageGenerationAdapter`를 만든다.
- 실제 AI adapter와 fallback adapter를 분리한다.
- API 호출은 서버리스 프록시를 통해서만 한다.
- 후보 JSON은 런타임 스키마로 검증한다.
- 빈 응답 또는 파싱 실패 시 1회 재시도 후 fallback 문구를 반환한다.
- `promptVersion`, `modelVersion`, `safetyRuleVersion`을 기록한다.

데이터 원칙:

- 사용자 원문은 analytics에 넣지 않는다.
- 생성 후보 전체를 영구 저장하지 않는다.
- 최종 선택/수정된 문장만 로컬 저장한다.
- AI 베타에서도 자동 저장과 자동 발송은 금지한다.

### v0.7: 실제 알림 검토

목표:

실제 알림은 마지막 단계로 둔다. 현재 앱은 local-first preview MVP이므로 지금 권한 요청 UI를 띄우면 과장 UX가 된다.

Apps in Toss:

- Smart Message 검수/템플릿 전제 확인
- `requestNotificationAgreement` 동의 흐름 확인
- 사용자 자유입력/AI 원문을 알림 본문에 쓸 수 있는지 공식 확인
- Toss user key/서버 호출 경계 설계

Google Play/Android:

- Android 13+ `POST_NOTIFICATIONS` 런타임 권한 확인
- Data Safety를 실제 바이너리 기준으로 재작성
- FCM/로컬 알림/분석 SDK 사용 여부에 따라 선언 갱신

성공 기준:

- 실제 알림 전까지 UI 문구는 `저장`, `미리보기`, `다시 보기`로 제한한다.
- `알림을 보내준다`, `내일 받아본다` 표현은 실제 delivery 구현 전 사용하지 않는다.

## 5. 안전 정책

공통 금지:

- 치료, 진단, 상담 대체 표현
- 자해, 자살, 폭력 조장
- 혐오, 차별
- 외모, 체중, 능력, 인격 공격
- 욕설, 모욕, 수치심 유발
- 불법 행동 유도

잔소리 원칙:

- 사람을 평가하지 않는다.
- 행동만 짚는다.
- 다음 행동 하나만 제시한다.
- `soft`와 `direct`만 제공한다.
- `strong`은 데이터와 문구 검수 전까지 보류한다.

AI 안전 흐름:

```text
사용자 입력 사전검사
→ 서버 프롬프트 제한
→ JSON 스키마 검증
→ 결정적 후처리 검사
→ 사용자 선택/수정
→ 최종 안전검사
→ 저장
```

위기 입력:

자해/자살 신호가 있으면 일반 후보 생성을 중단하고 안전 안내 화면으로 전환한다. 한국 사용자를 기준으로는 109 자살예방상담전화 같은 즉시 도움 경로를 별도 검토한다.

## 6. 플랫폼/개인정보 기획

현재 버전:

- local-first
- 실제 알림 없음
- AI 없음
- 로그인 없음
- 광고/IAP 없음
- 백엔드 없음
- 자유 입력 원문 analytics 전송 없음

AI 도입 버전:

- 외부 AI 전송 전 사전 고지
- 민감정보 입력 금지 안내
- 개인정보처리방침 업데이트
- Apps in Toss AI 고지/라벨 대응
- Google Play 인앱 신고 대응
- Data Safety 재작성

DeepSeek 사용 시:

- API 키는 server-only 환경변수에 둔다.
- 프런트 번들에 키를 넣지 않는다.
- 외부 전송 사실과 민감정보 금지 안내를 명확히 표시한다.
- 모델명, 프롬프트 버전, 안전규칙 버전을 기록한다.

## 7. 구현 시 파일 방향

구현은 아직 하지 않는다. 실제 구현 요청이 오면 다음 순서가 안전하다.

1. `src/App.tsx`의 하드코딩 safety rule을 `src/domain/safety/rules.ts`로 분리
2. `src/data/message-templates.v0.1.json`의 nag 후보를 현재 흐름에 연결
3. 모드 선택 UI를 기존 6-screen 흐름에 추가
4. 보관함 empty/reuse UX 개선
5. `MessageGenerationAdapter` 인터페이스만 추가
6. fallback adapter로 AI 없는 후보 생성 UX 검증
7. 서버리스 proxy와 DeepSeek adapter 연결
8. AI 신고/라벨/동의/차단 상태 추가
9. 실제 알림은 별도 게이트 후 진행

## 8. 테스트/검증 기준

v0.5a:

- 기존 테스트 유지
- 칭찬/살짝 밀어줘/직접쓰기 모드 선택 테스트
- nag 후보가 모욕/비난 없이 표시되는지 테스트
- `preview_only` 문구가 실제 알림처럼 보이지 않는지 테스트
- ko/en i18n 테스트
- localStorage 손상 복구 유지

v0.6:

- 후보가 정확히 5개인지 테스트
- JSON 파싱 실패 fallback 테스트
- 빈 응답 1회 재시도 테스트
- AI 미동의 시 기본 문구만 사용 테스트
- free-text analytics 차단 테스트
- API 키 프런트 번들 미포함 확인
- 신고 액션 테스트
- 위기/blocked 입력 차단 테스트

## 9. 최종 한 줄

`칭찬해줘`는 지금 버릴 앱이 아니라, "내가 고르고 내가 다듬는 한마디"라는 강점 위에 `행동 리마인드`와 `선택형 AI 후보`를 단계적으로 얹어야 하는 앱이다.

바로 AI 앱으로 바꾸는 것이 아니라, 먼저 사용자가 직접 누르고 고르는 자기조율 경험을 더 좋아지게 만든 뒤 AI를 옵션으로 붙인다.

## 10. 참고한 근거

- 현재 목표: `GOAL.md`
- 현재 실행계획: `PLAN.md`
- 현재 상태: `STATUS.md`
- canonical 제품기획: `ai/plans/product-plan.md`
- 첨부 추가기획안: `/Users/kangsungbae/.codex/attachments/2906b046-eb5f-4cc7-9381-f7382c66447b/pasted-text.txt`
- 현재 preview-only adapter: `src/platform/adapters.ts`
- 현재 메시지 템플릿: `src/data/message-templates.v0.1.json`
- Apps in Toss 서비스 오픈 정책: https://developers-apps-in-toss.toss.im/intro/guide.html
- Apps in Toss AI 채팅/상담 주의사항: https://developers-apps-in-toss.toss.im/intro/caution.html
- Apps in Toss Smart Message: https://developers-apps-in-toss.toss.im/smart-message/develop.html
- Apps in Toss 알림 동의문: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%9D%B8%ED%84%B0%EB%A0%89%EC%85%98/requestNotificationAgreement.html
- Google Play AI-Generated Content: https://support.google.com/googleplay/android-developer/answer/13985936?hl=en
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
- Android notification permission: https://developer.android.com/develop/ui/compose/notifications/notification-permission
- DeepSeek API docs: https://api-docs.deepseek.com/
- DeepSeek JSON Output: https://api-docs.deepseek.com/guides/json_mode
- DeepSeek Privacy Policy: https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html
