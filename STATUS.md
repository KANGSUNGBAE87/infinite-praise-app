---
project: 칭찬해줘
english_name: Praise Me
version: 1.0
status: current-baseline
verified_at: 2026-06-21
---

# STATUS.md

## 1. 한 줄 상태

현재 `칭찬해줘`는 **음성/TTS 없는 6-screen local-first 자기조율 MVP**다.
사용자는 한 줄을 고르고, 선택적으로 수정하고, 시간을 저장해 미리보기를 본다.
실제 알림은 보내지 않으며, 저장 상태를 다시 열면 다음 날 체크인 흐름으로 진입한다.

---

## 2. 현재 제품 상태

- 제품명: `칭찬해줘`
- 영어명: `Praise Me`
- 제품 성격: 비게임 생활형 앱
- 우선 플랫폼: Apps in Toss first
- 호환 목표: Google Play compatible
- 구현 방식: React + TypeScript + Vite 기반 local-first UI
- 출시 상태: 로컬/PWA 기능 검증 단계
- 스토어 제출 준비: 미완료

---

## 3. 현재 활성 화면

1. Landing / Target Confirm
2. Praise Pick
3. Rewrite Optional
4. Time Save + Preview
5. Next-day Check-in
6. Result / Trust-safe Interest Slot

### 현재 흐름 요약

```text
Landing
→ 칭찬 선택
→ 선택적 수정
→ 시간 저장과 미리보기
→ 첫 세션 종료
→ localStorage의 reopened 상태로 재진입
→ 체크인
→ 결과/관심 슬롯
```

---

## 4. 현재 구현된 기능

### 동작함

- 한국어/영어 전환
- 칭찬 카드 3개 우선 노출
- 추가 2개 확장 노출
- 칭찬 선택
- 사용자 문구 수정
- 로컬 keyword 기반 safety state
- 시간 입력
- 저장 및 미리보기
- localStorage 상태 저장
- 손상된 localStorage JSON 복구
- 다음 방문 상태 진입
- 체크인 액션
- 이벤트 payload sanitizer
- platform adapter stub

### 구현되지 않음

- 실제 알림 delivery
- 음성/TTS/오디오
- AI 생성·상담
- 로그인
- 광고
- 결제/IAP
- 백엔드
- 네트워크 전송
- 스토어 제출

---

## 5. 활성 코드 구조

### 주요 엔트리

- `src/main.tsx`
- `src/App.tsx`
- `src/i18n.ts`
- `src/styles.css`
- `src/core/analyticsSanitizer.ts`
- `src/platform/adapters.ts`

### App 상태

주요 필드:

- `step`
- `selectedPraiseId`
- `selectedPraise`
- `rewriteText`
- `scheduleTime`
- `previewText`
- `checkinAction`
- `reopenSource`
- `safetyState`
- `interestAction`
- `sessionPhase`
- `savedAt`

### 저장 키

- locale: `praise-me:locale-v1`
- app state: `praise-me:state`

---

## 6. 디자인 시스템 현황

현재 `src/styles.css`에 A2 웜·파스텔 시각 시스템이 구현되어 있다.

주요 클래스:

- `pm-primary-cta`
- `pm-secondary-cta`
- `pm-choice-card`
- `pm-text-action`
- `lang-option`
- `lang-compact`

현재 확인된 수정 상태:

- primary CTA 최소 높이 56px
- secondary CTA 최소 높이 52px
- 선택 카드 border가 primary 색상 사용
- 사용자 화면에 analytics JSON 노출 없음
- raw/default button 없음

---

## 7. 안전 계약

현재 자유 입력 safety는 로컬 keyword rule이다.

### caution

키워드 예:

- `한심`
- `왜 맨날`
- `넌 왜`

동작:

- 안내 표시
- 저장 가능
- caution 이벤트 가능

### blocked

키워드 예:

- `죽어`
- `자해`
- `폭력`
- `진단`
- `치료`

동작:

- 저장 버튼 비활성화
- blocked 이벤트 발생
- rewrite 저장 이벤트가 발생하면 안 됨

주의:

현재 rule은 완전한 moderation 시스템이 아니다.
자유 입력 원문을 실제 알림 본문이나 외부 서비스로 보내지 않는 것이 현재 가장 안전한 제품 방향이다.

---

## 8. 분석 계약

현재 analytics adapter는 no-op이다.
외부 전송은 없지만 테스트는 이벤트 이름과 payload 형태를 검증한다.

허용 필드:

- `event`
- `source`
- `action`
- `status`
- `locale`
- `choice`
- `variant`
- `screen`

자유 입력 원문과 text-shaped key는 drop되어야 한다.

---

## 9. 테스트 및 빌드 상태

2026-06-21 기준 확인 결과:

```text
npm test      → 17 files passed, 70 tests passed
npm run build → TypeScript 및 Vite production build 통과
```

핵심 테스트 범위:

- Landing 렌더링
- blocked/caution rewrite
- 저장 상태 복구
- 첫 세션 Step 4 종료
- reopened 진입
- D1 keep/edit/skip 흐름
- locale 전환
- free-text analytics 차단
- platform adapter stub

---

## 10. 현재 알려진 한계

### 제품

- 첫 세션 이후 재방문 홈이 약함
- D1 관심 슬롯이 재방문 보상보다 수익화 탐색처럼 보일 수 있음
- 보관함이 아직 핵심 경험으로 연결되지 않음
- 실제 알림이 없어 시간 저장의 의미가 제한적임

### 디자인

- 화면별 정보 계층을 더 정교하게 다듬을 여지가 있음
- 재방문 홈·보관함·주간 기록의 시각 시스템은 아직 목표안 단계
- 실제 기기 Safe Area 검증 미완료

### 플랫폼

- Apps in Toss sandbox 미검증
- Toss QR/test scheme 미검증
- 개인정보처리방침 URL 없음
- Google Play Data Safety 작성 안 됨
- 실제 알림 정책/권한 UX 미설계

### 개발 운영

- `src/App.tsx`에 흐름과 이벤트가 집중되어 있어 리팩터링 위험이 큼
- 레거시 reminder/audio 도메인 파일이 남아 있으나 현재 App import graph 밖임
- worktree에 다수 untracked 파일이 있으므로 광범위한 cleanup이나 `git add -A` 금지

---

## 11. 현재 의사결정

확정:

- 앱명은 `칭찬해줘`
- 영문명은 `Praise Me`
- local-first 유지
- ko/en 유지
- 현재 MVP에서 실제 알림·음성·AI·로그인·광고·결제·백엔드 제외
- Apps in Toss 우선
- A2 warm/pastel 디자인 기반 유지

다음 검토 대상:

- 재방문 홈 도입
- D1 체크인 카피 개편
- 로컬 보관함
- `나를 챙긴 날` 기록
- 결과/관심 슬롯 유지 여부

---

## 12. 바로 다음 작업

권장 순서:

1. 변경 전 `npm test`, `npm run build`
2. 현재 화면 캡처와 상태 저장
3. 재방문 홈 정보 구조 확정
4. 체크인 액션 카피 확정
5. 360×740 기준 디자인 적용
6. localStorage/i18n/safety 회귀 테스트
7. 세션로그 및 Graphify 갱신

---

## 13. 작업자 주의사항

- 현재 `src/App.tsx`를 수정하기 전에 테스트를 먼저 읽는다.
- 레거시 reminder/audio 파일을 임의로 live flow에 연결하지 않는다.
- platform adapter stub을 실제 SDK로 바꾸지 않는다.
- 자유 입력 원문을 이벤트에 추가하지 않는다.
- 저장 schema 변경 시 migration 또는 normalize fallback을 추가한다.
- 스토어 제출이나 플랫폼 권한 작업은 별도 승인 없이 진행하지 않는다.
