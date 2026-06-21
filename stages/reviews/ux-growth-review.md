# [CHALLENGE] 칭찬해줘 UX B — 리텐션/수익/이탈 관점 반박

- reviewer: ux-growth
- date: 2026-06-19 KST
- phase: UX / B challenge
- input: `stages/10_UX_FINAL.md`, `stages/08_PRODUCT_PLAN.md`, shared knowledge monetization docs
- verdict: **CHANGES_REQUIRED**

---

## #1 return_next_day 측정 소스 공백

notification-open과 manual-open을 구분하지 않아 D1 신호가 infrastructure noise에 오염된다.
Experiment 2의 통과/실패 기준이 실제 반복 의도가 아닌 notification delivery 안정성에 좌우된다.

**영향**: notification delivery가 불안정한 private mini-app 환경에서 D1 0으로 kill criteria 오발동 위험.

**권장 대안**:
- `return_next_day` 이벤트에 `source` 파라미터 필수 추가: `notification` | `manual` | `unknown`
- `reopen_reason_tagged`를 check-in 직후(현재는 "마지막에" 위치)로 이동해 이유 태깅이 return_next_day와 같은 세션 내에서 완료되게 설계

**필수 이벤트**: `return_next_day` (source 파라미터 포함), `reopen_reason_tagged`

**성공 기준**: source별 return_next_day 분리 측정이 가능하고, notification_open_rate가 낮아도 manual return_users >= 1이면 Experiment 2 진행

**중단 기준**: source 구분 없이 aggregate return_next_day만 측정되면 Experiment 2 신뢰 불가 → block

---

## #2 notification-first D1 루프의 manual fallback 부재

Screen 5 (Next-day Check-in)는 notification 수신을 전제로 설계됐으나, 정작 notification delivery pilot(Experiment 3)은 D1 검증(Experiment 2) 이후에 실행된다. notification이 실패해도 사용자가 "어제 칭찬 다시 보기"로 수동 진입할 수 있는 경로가 없다.

**영향**: 사용자가 notification을 받지 못하면 check-in 화면에 도달할 수 없고, D1 지표가 infrastructure 실패로 0이 되어 kill criteria 오발동.

**권장 대안**:
- Screen 5 진입 경로에 "어제 저장한 한 줄 다시 보기" 수동 CTA를 홈 또는 landing에 추가
- notification 미수신 상태에서도 check-in 가능하도록 설계 (notification token 없이도 reminder_created 기반으로 check-in prompt 표시)

**필수 이벤트**: `return_next_day_manual` 추가

**성공 기준**: notification_open_rate < 50%여도 manual return_next_day_users >= 1이면 Experiment 2 통과로 간주

**중단 기준**: notification + manual 모두 return_users = 0 → 반복 사용 가설 실패

---

## #3 fake-door CTA post-click dead-end

Screen 6의 "마음에 든 한 줄 보관함 보기" CTA를 클릭한 후의 UX가 전혀 지정되지 않았다. 아무 일도 일어나지 않거나 빈 화면이 나오면 감정 앱의 신뢰를 훼손한다. trust-safe boundary 문서는 D7 + 주 3회 repeat use 전 monetization 보류를 권장하지만, 이 CTA는 D1에 등장한다.

**영향**: `vault_interest_clicked`가 monetization 관심이 아닌 curiosity click을 측정하게 되고, dead-end 경험은 D7 retention에 악영향.

**권장 대안**:
- 클릭 시 "곧 준비할게요" 같은 dismissible 안내 + 관심 등록(이메일 선택) flow 추가
- `vault_interest_clicked` 이후 `vault_interest_handled` 이벤트로 사용자가 어떤 행동을 했는지 기록 (dismissed | registered | ignored)

**필수 이벤트**: `vault_interest_handled` (dismissed | registered | ignored)

**성공 기준**: `vault_interest_clicked >= 1`이고 `vault_interest_handled`가 dismissed/registered로 기록됨

**중단 기준**: `vault_interest_clicked > 0`인데 `vault_interest_handled = 0`이면 UX dead-end로 간주 → monetization CTA 재설계 또는 제거

---

## Knowledge candidates

- maturity: provisional
  summary: 감정 앱의 D1 return_next_day 측정은 notification-open과 manual-open을 source 파라미터로 분리해야 infrastructure noise와 실제 반복 의도를 구분할 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ux-growth-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md

- maturity: provisional
  summary: notification-first 루프의 첫 검증에서는 notification delivery가 불안정할 수 있으므로, 수동 재진입 경로를 설계 단계부터 포함해야 infrastructure failure를 product failure로 오판하지 않는다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ux-growth-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md

- maturity: provisional
  summary: 감정 앱의 fake-door monetization CTA는 post-click dead-end가 없도록 dismissible 안내 또는 관심 등록 flow를 함께 설계해야 trust 훼손을 방지하고 의미 있는 monetization signal을 얻을 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ux-growth-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md
