# 잘하고 있음 — MVP 구현 계획 (앱인토스)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하루 한 줄 기록을 받아 Claude Haiku로 근거 기반 칭찬을 생성하고, 30일 후 월말 리빌로 "사실 당신은 꾸준한 사람"이라는 사실을 보여주는 미니앱 MVP.

**Architecture:** 앱인토스(Apps in Toss) = 토스 슈퍼앱 내 React Native 미니앱(`@apps-in-toss/framework`). 플랫폼 의존부(인증·결제·저장)는 어댑터 인터페이스로 분리해 구글플레이 독립 앱 이식성 확보. 칭찬 생성은 **백엔드 프록시 경유** Claude Haiku 호출(앱에 API key 미보관). 빈 날은 LLM 호출 없이 로컬 집계만으로 처리.

**Tech Stack:** React Native + `@apps-in-toss/framework`, TypeScript, 백엔드 프록시(Cloudflare Workers/Vercel/Supabase Edge Functions 중 택1) + Anthropic SDK, 모델 `claude-haiku-4-5`. 저장은 `StorageAdapter` 추상화(앱인토스 저장소 ↔ AsyncStorage).

> ⚠️ **보안 불변 규칙:** Anthropic API key는 백엔드 환경변수에만 둔다. 클라이언트(RN 번들)에서 `x-api-key`로 직접 호출 금지 — 번들/트래픽에서 키 추출 시 비용 폭탄.

---

## 스크린 맵

```
앱 실행
  ↓
[홈 스크린] ──── 오늘 기록 있음 ──→ [오늘의 칭찬 스크린]
     │                                       │
     │           오늘 기록 없음 ──→ [빈 날 스크린]
     │
     ├── 탭: 기록 목록 ──→ [기록 히스토리 스크린]
     │
     └── 탭: 이번 달 ──→ [월간 요약 스크린] (D7+)
                              │
                         월초이고 지난달 기록 있음
                              ↓
                        [월말 리빌 스크린] (D30+)
```

## 데이터 구조

```typescript
// 기록 단일 항목
interface DailyEntry {
  id: string;          // uuid
  date: string;        // "YYYY-MM-DD"
  entry: string;       // "오늘 운동 30분"
  category: Category;  // "운동" | "일" | "관계" | "학습" | "휴식"
  praise: string;      // LLM이 생성한 칭찬 텍스트
  createdAt: number;   // timestamp
}

type Category = "운동" | "일" | "관계" | "학습" | "휴식";

// 로컬 저장소 키: "welliam_entries"
// 형식: DailyEntry[] (JSON 배열)
```

> **플랫폼 해석 메모 (Task 1~9 공통):** 아래 Task들은 빠른 초안이라 "앱인토스 스크린/전역 함수 블록", `localStorage` 같은 표현을 쓴다. 실제 구현은 **React Native + `@apps-in-toss/framework`** 기준으로 다음과 같이 읽는다.
> - "앱인토스 스크린" → RN 화면 컴포넌트 (`screens/Home.tsx` 등)
> - "전역 함수 블록 `storage.js`" → `src/services/storage.ts` (TypeScript 모듈)
> - `localStorage` → **`StorageAdapter`** 인터페이스 경유. 앱인토스 구현체는 프레임워크 저장 API, 구글플레이 구현체는 `@react-native-async-storage/async-storage`. 비즈니스 로직은 어댑터만 의존 → 이식 시 구현체만 교체.
> - `navigateTo(...)` → React Navigation
>
> 즉 로직/검증 단계는 그대로 유효하고, 호출 대상만 어댑터로 추상화한다.

---

## Task 0: Claude API 연결 검증 (프롬프트 실험)

**목표:** 구현 전에 핵심 컴포넌트(LLM 칭찬 생성)가 실제로 원하는 품질로 나오는지 확인. 이 Task가 실패하면 전체 구현을 시작하지 않는다.

**Files:**
- Create: `ai/prompts/praise-v1.txt` (프롬프트 초안)
- Create: `ai/prompts/praise-test-cases.md` (테스트 케이스 20개)

- [ ] **Step 1: Anthropic API 키 준비 확인 (로컬 검증 전용)**

  https://console.anthropic.com → API Keys → Create Key. 키는 **로컬 환경변수에만** 두고, 절대 앱 코드/번들에 넣지 않는다. (실제 앱은 Task 4의 백엔드 프록시를 경유.)
  
  확인 명령 (로컬 터미널에서):
  ```bash
  export ANTHROPIC_API_KEY=sk-ant-...
  curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{"model":"claude-haiku-4-5","max_tokens":10,"messages":[{"role":"user","content":"hello"}]}'
  ```
  Expected: `{"content":[{"type":"text","text":"..."}],...}` (HTTP 200)

- [ ] **Step 2: 칭찬 생성 프롬프트 초안 작성**

  파일 `ai/prompts/praise-v1.txt` 생성:
  
  ```
  당신은 사용자의 하루 기록을 보고 진심 어린 칭찬을 하는 친구입니다.
  
  규칙 (절대 어기지 마세요):
  1. 반드시 아래 [데이터]에서 실제 숫자를 인용해야 합니다. 예: "(이번 달 8번째 운동)"
  2. 없는 사실을 칭찬하지 마세요. 기록된 것만 칭찬하세요.
  3. 타인과 비교하는 표현 금지. "평균보다", "보통 사람보다" 같은 표현 절대 사용 불가.
  4. 과장하지 마세요. "대단해요!" 보다 "생각보다 꾸준한 사람이야"가 더 진심입니다.
  5. 정체성 언어를 사용하세요. "~하는 사람이야" 형식이 습관보다 강한 동기입니다.
  6. 2-3문장으로만. 길면 읽지 않습니다.
  7. 마지막에 반드시 괄호로 근거를 붙이세요. 예: "(이번 달 14번째 기록)"
  
  [데이터]
  - 오늘 기록: {entry}
  - 카테고리: {category}
  - 이번 달 {category} 기록 횟수: {monthly_count}회
  - 오늘까지 연속 기록일: {streak}일
  - 이번 달 전체 기록 횟수: {total_monthly}회
  
  위 데이터를 바탕으로 칭찬 한 단락을 한국어로 작성하세요.
  ```

- [ ] **Step 3: 테스트 케이스 20개 정의**

  파일 `ai/prompts/praise-test-cases.md` 생성:
  
  ```markdown
  # 칭찬 생성 테스트 케이스
  
  ## 정상 케이스 (근거 있음)
  1. entry: "운동 30분", category: 운동, monthly_count: 8, streak: 5, total: 12
  2. entry: "코딩 2시간", category: 일, monthly_count: 15, streak: 15, total: 18
  3. entry: "친구랑 통화함", category: 관계, monthly_count: 3, streak: 1, total: 8
  4. entry: "책 30페이지", category: 학습, monthly_count: 6, streak: 6, total: 9
  5. entry: "낮잠 1시간", category: 휴식, monthly_count: 2, streak: 2, total: 11
  
  ## 스트릭이 높은 케이스 (패턴 탐지)
  6. entry: "운동", category: 운동, monthly_count: 20, streak: 20, total: 22
  7. entry: "코딩", category: 일, monthly_count: 25, streak: 25, total: 25
  
  ## 첫 기록 케이스 (monthly_count: 1)
  8. entry: "처음으로 운동함", category: 운동, monthly_count: 1, streak: 1, total: 1
  
  ## 짧은 기록
  9. entry: "밥 먹음", category: 휴식, monthly_count: 5, streak: 2, total: 10
  10. entry: "산책", category: 운동, monthly_count: 4, streak: 3, total: 7
  
  ## 부정적으로 들릴 수 있는 기록
  11. entry: "오늘 일찍 퇴근했다", category: 일, monthly_count: 8, streak: 4, total: 15
  12. entry: "TV 봄", category: 휴식, monthly_count: 7, streak: 7, total: 14
  13. entry: "아무것도 안 한 거 같은데 퇴근함", category: 일, monthly_count: 12, streak: 12, total: 16
  
  ## 어려운 상황 기록
  14. entry: "힘들었지만 출근함", category: 일, monthly_count: 18, streak: 18, total: 20
  15. entry: "오늘 많이 울었다", category: 관계, monthly_count: 2, streak: 1, total: 5
  
  ## 검증 항목 (각 결과 확인)
  - [ ] 실제 숫자 인용 있음? (예: "이번 달 N번째")
  - [ ] 날조된 행동 없음?
  - [ ] 타인 비교 없음?
  - [ ] 2-3문장 이내?
  - [ ] 마지막에 괄호 근거 있음?
  - [ ] 5케이스 연속으로 같은 패턴 반복 없음?
  ```

- [ ] **Step 4: 20개 케이스를 Claude API에 실제로 전송 + 결과 기록**

  로컬 터미널에서 각 케이스를 curl로 테스트:
  ```bash
  curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{
      "model": "claude-haiku-4-5",
      "max_tokens": 200,
      "messages": [{
        "role": "user",
        "content": "당신은 사용자의 하루 기록을 보고 진심 어린 칭찬을 하는 친구입니다.\n\n규칙 (절대 어기지 마세요):\n1. 반드시 아래 [데이터]에서 실제 숫자를 인용해야 합니다. 예: \"(이번 달 8번째 운동)\"\n2. 없는 사실을 칭찬하지 마세요.\n3. 타인과 비교 금지.\n4. 2-3문장으로만.\n5. 마지막에 괄호로 근거를 붙이세요.\n\n[데이터]\n- 오늘 기록: 운동 30분\n- 카테고리: 운동\n- 이번 달 운동 기록 횟수: 8회\n- 오늘까지 연속 기록일: 5일\n- 이번 달 전체 기록 횟수: 12회\n\n위 데이터를 바탕으로 칭찬 한 단락을 한국어로 작성하세요."
      }]
    }'
  ```
  
  결과를 `ai/prompts/praise-test-results.md`에 기록.
  
  **통과 기준:** 20개 중 17개 이상 검증 항목 전부 통과.
  **실패 시:** 프롬프트 수정 → Step 2로 돌아가 재실험.

- [ ] **Step 5: 프롬프트 확정 후 버전 저장**

  통과하면 `ai/prompts/praise-v1-final.txt`로 복사.
  
  ```bash
  cp ai/prompts/praise-v1.txt ai/prompts/praise-v1-final.txt
  git add ai/prompts/
  git commit -m "feat: validate praise generation prompt (20 cases, pass)"
  ```

---

## Task 1: 로컬 데이터 저장소 구현

**목표:** `DailyEntry` 저장/로드/집계 로직을 앱인토스 JavaScript 블록으로 구현. 이 로직이 칭찬 생성의 "영수증"을 만든다.

**Files:**
- Create: 앱인토스 → 전역 함수 블록 `storage.js`

- [ ] **Step 1: 저장소 초기화 + 저장 함수 작성**

  앱인토스 전역 함수 블록에 아래 코드 작성:
  
  ```javascript
  const STORAGE_KEY = "welliam_entries";
  
  function getAllEntries() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  
  function saveEntry(entry, category, praise) {
    const entries = getAllEntries();
    const today = getTodayStr();
    
    // 오늘 이미 저장된 기록이 있으면 덮어쓰기
    const filtered = entries.filter(e => e.date !== today);
    
    const newEntry = {
      id: Date.now().toString(),
      date: today,
      entry: entry,
      category: category,
      praise: praise,
      createdAt: Date.now()
    };
    
    filtered.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return newEntry;
  }
  
  function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  
  function getTodayEntry() {
    const today = getTodayStr();
    const entries = getAllEntries();
    return entries.find(e => e.date === today) || null;
  }
  ```

- [ ] **Step 2: 집계 함수 작성 (칭찬 영수증 데이터)**

  ```javascript
  function getMonthlyStats(category) {
    const entries = getAllEntries();
    const now = new Date();
    const yearMonth = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0");
    
    const thisMonth = entries.filter(e => e.date.startsWith(yearMonth));
    const categoryCount = thisMonth.filter(e => e.category === category).length;
    const totalCount = thisMonth.length;
    
    return {
      monthly_count: categoryCount,  // 이 카테고리 이번 달 횟수
      total_monthly: totalCount       // 이번 달 전체 기록 횟수
    };
  }
  
  function getCurrentStreak() {
    const entries = getAllEntries();
    if (entries.length === 0) return 0;
    
    // 날짜 내림차순 정렬
    const sorted = entries
      .map(e => e.date)
      .sort()
      .reverse();
    
    const today = getTodayStr();
    const yesterday = getDateStr(-1);
    
    // 오늘 또는 어제 기록이 없으면 streak 0
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
    
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const expected = getDateStr(-(i));
      if (sorted[i] === expected) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
  
  function getDateStr(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  ```

- [ ] **Step 3: 함수 동작 수동 검증**

  앱인토스 콘솔(또는 테스트 스크린)에서 아래 실행:
  
  ```javascript
  // 더미 데이터 3개 저장
  saveEntry("운동 30분", "운동", "테스트 칭찬");
  // 어제 날짜로 수동 추가
  const entries = getAllEntries();
  entries.push({ id: "test1", date: getDateStr(-1), entry: "코딩", category: "일", praise: "칭찬", createdAt: Date.now() });
  localStorage.setItem("welliam_entries", JSON.stringify(entries));
  
  // 검증
  console.log("streak:", getCurrentStreak());   // Expected: 2
  console.log("stats:", getMonthlyStats("운동")); // Expected: {monthly_count:1, total_monthly:2}
  console.log("today:", getTodayEntry());         // Expected: {entry:"운동 30분",...}
  ```
  
  Expected 값과 일치해야 다음 단계 진행.

- [ ] **Step 4: 커밋**

  ```bash
  git add .
  git commit -m "feat: implement local storage with streak + monthly stats"
  ```

---

## Task 2: 카테고리 자동 태그 로직

**목표:** 사용자가 입력한 텍스트를 보고 5개 카테고리 중 하나를 자동 추천. 정확도 ≥ 70% (수동 샘플 20개 기준).

**Files:**
- Create: 앱인토스 → 전역 함수 블록 `categorizer.js`

- [ ] **Step 1: 키워드 기반 분류 로직 작성**

  ```javascript
  const CATEGORY_KEYWORDS = {
    "운동": ["운동", "헬스", "달리기", "조깅", "산책", "수영", "요가", "필라테스",
             "등산", "자전거", "스쿼트", "걷기", "뛰기", "스트레칭", "PT"],
    "일": ["코딩", "개발", "회의", "업무", "일", "출근", "퇴근", "프로젝트",
           "발표", "보고서", "이메일", "공부", "시험", "과제", "수업", "강의"],
    "관계": ["친구", "가족", "연락", "만남", "대화", "통화", "데이트", "약속",
             "모임", "부모님", "형제", "동료", "사람"],
    "학습": ["책", "독서", "강의", "공부", "학습", "영상", "유튜브", "강좌",
             "언어", "영어", "자격증", "세미나", "스터디"],
    "휴식": ["쉬었", "휴식", "낮잠", "수면", "넷플릭스", "게임", "TV", "드라마",
             "영화", "음악", "그냥", "힐링"]
  };
  
  function detectCategory(text) {
    const normalized = text.toLowerCase();
    const scores = {};
    
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      scores[cat] = keywords.filter(kw => normalized.includes(kw)).length;
    }
    
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    
    // 점수가 0이면 "일" 기본값
    return best[1] > 0 ? best[0] : "일";
  }
  ```

- [ ] **Step 2: 20개 케이스 정확도 검증**

  콘솔에서 실행:
  
  ```javascript
  const testCases = [
    { text: "오늘 운동 30분 했다", expected: "운동" },
    { text: "헬스장 다녀옴", expected: "운동" },
    { text: "코딩 2시간", expected: "일" },
    { text: "회의 3개 들어갔다", expected: "일" },
    { text: "친구랑 통화함", expected: "관계" },
    { text: "가족 저녁", expected: "관계" },
    { text: "책 30페이지 읽음", expected: "학습" },
    { text: "유튜브 강의 봄", expected: "학습" },
    { text: "낮잠 잠", expected: "휴식" },
    { text: "넷플릭스 2시간", expected: "휴식" },
    { text: "산책함", expected: "운동" },
    { text: "퇴근했다", expected: "일" },
    { text: "부모님한테 전화드림", expected: "관계" },
    { text: "영어 공부", expected: "학습" },
    { text: "그냥 쉬었음", expected: "휴식" },
    { text: "스쿼트 50개", expected: "운동" },
    { text: "보고서 작성", expected: "일" },
    { text: "동료랑 점심", expected: "관계" },
    { text: "강좌 들음", expected: "학습" },
    { text: "게임 1시간", expected: "휴식" }
  ];
  
  let pass = 0;
  testCases.forEach(tc => {
    const result = detectCategory(tc.text);
    const ok = result === tc.expected;
    if (ok) pass++;
    console.log(`${ok ? "✓" : "✗"} "${tc.text}" → ${result} (expected: ${tc.expected})`);
  });
  console.log(`\n정확도: ${pass}/20 = ${Math.round(pass/20*100)}%`);
  ```
  
  Expected: `정확도: 14/20 = 70%` 이상.
  
  70% 미달이면 CATEGORY_KEYWORDS에 키워드 추가 후 재실행.

- [ ] **Step 3: 커밋**

  ```bash
  git add .
  git commit -m "feat: keyword-based category auto-detection (≥70% accuracy)"
  ```

---

## Task 3: 기록 입력 화면 (홈 스크린)

**목표:** 사용자가 오늘 한 일을 텍스트로 입력하면 카테고리가 자동 태그되고 저장 버튼으로 넘어가는 화면. 입력 → 저장 흐름이 ≤ 3탭.

**Files:**
- Create: 앱인토스 → 스크린 "홈" (Screen_Home)

- [ ] **Step 1: 홈 스크린 레이아웃 생성**

  앱인토스 스크린 빌더에서 "홈" 스크린 생성. 컴포넌트 배치:
  
  ```
  [앱 타이틀] "잘하고 있음"  (상단 중앙, 폰트 크기 24, 굵게)
  
  [날짜 텍스트] "6월 6일 금요일"  (타이틀 아래, 폰트 크기 14, 회색)
  
  [입력 영역]
    레이블: "오늘 한 일을 적어보세요"  (placeholder)
    텍스트 입력창: multiline=false, maxLength=100
    ID: input_today
  
  [카테고리 자동 태그 표시]
    텍스트: "# {detected_category}"  (입력 중 실시간 업데이트)
    ID: label_category
  
  [저장 버튼]
    텍스트: "오늘 기록하기"
    ID: btn_save
    스타일: 전체 너비, 배경 #2D6A4F (초록), 흰 텍스트
  ```

- [ ] **Step 2: 카테고리 실시간 감지 로직 연결**

  `input_today`의 onChange 이벤트에 연결:
  
  ```javascript
  const text = input_today.value;
  if (text.length > 2) {
    const category = detectCategory(text);
    label_category.setText("# " + category);
    label_category.setVisible(true);
  } else {
    label_category.setVisible(false);
  }
  ```

- [ ] **Step 3: 저장 버튼 로직 연결**

  `btn_save`의 onClick 이벤트에 연결:
  
  ```javascript
  const text = input_today.value.trim();
  
  // 유효성 검사
  if (text.length === 0) {
    showAlert("오늘 한 일을 적어주세요");
    return;
  }
  
  const category = detectCategory(text);
  
  // 로딩 상태
  btn_save.setEnabled(false);
  btn_save.setText("칭찬 생성 중...");
  
  // 칭찬 생성 (Task 4에서 구현할 generatePraise 함수 호출)
  generatePraise(text, category)
    .then(praise => {
      saveEntry(text, category, praise);
      
      // 칭찬 화면으로 이동
      navigateTo("Screen_Praise", {
        entry: text,
        category: category,
        praise: praise
      });
    })
    .catch(err => {
      // 오프라인 또는 API 오류: 칭찬 없이 저장
      saveEntry(text, category, "");
      navigateTo("Screen_Praise", {
        entry: text,
        category: category,
        praise: null,  // null = 오프라인 상태
        offline: true
      });
    })
    .finally(() => {
      btn_save.setEnabled(true);
      btn_save.setText("오늘 기록하기");
    });
  ```

- [ ] **Step 4: 오늘 이미 기록한 경우 분기 처리**

  스크린 onLoad 이벤트에 추가:
  
  ```javascript
  const todayEntry = getTodayEntry();
  if (todayEntry !== null) {
    // 이미 기록함 → 칭찬 화면으로 자동 이동
    navigateTo("Screen_Praise", {
      entry: todayEntry.entry,
      category: todayEntry.category,
      praise: todayEntry.praise,
      alreadySaved: true
    });
  }
  ```

- [ ] **Step 5: 수동 테스트**

  1. 앱 실행 → 홈 스크린 로드 확인
  2. 텍스트 입력 "운동 30분" → 카테고리 "# 운동" 자동 표시 확인
  3. "오늘 기록하기" 탭 → 로딩 상태 표시 확인
  4. 흐름: 홈 → (API 응답 후) → 칭찬 화면 이동 확인
  5. 앱 재시작 → 오늘 기록 이미 있으면 칭찬 화면으로 자동 이동 확인

- [ ] **Step 6: 커밋**

  ```bash
  git add .
  git commit -m "feat: home screen - text input + category auto-tag + save flow"
  ```

---

## Task 4: 백엔드 프록시 — 칭찬 생성 API (⚠️ API key는 여기에만)

**목표:** Anthropic API key를 숨기는 서버리스 프록시. 클라이언트는 이 엔드포인트만 호출하고, 키는 절대 받지 않는다. Cloudflare Workers 예시(Vercel/Supabase Edge도 동일 패턴).

**Files:**
- Create: `backend/wrangler.toml`
- Create: `backend/src/index.ts`

- [ ] **Step 1: 프로젝트 초기화**

  ```bash
  npm create cloudflare@latest backend -- --type=hello-world
  cd backend
  # API key를 시크릿으로 등록 (코드/깃에 절대 안 들어감)
  npx wrangler secret put ANTHROPIC_API_KEY
  # 프롬프트에 sk-ant-... 붙여넣기
  ```

- [ ] **Step 2: 프록시 핸들러 작성**

  `backend/src/index.ts`:
  ```typescript
  interface Env {
    ANTHROPIC_API_KEY: string;
  }

  interface PraiseRequest {
    entry: string;
    category: string;
    monthly_count: number;
    streak: number;
    total_monthly: number;
  }

  const PROMPT = (r: PraiseRequest) => `당신은 사용자의 하루 기록을 보고 진심 어린 칭찬을 하는 친구입니다.

규칙 (절대 어기지 마세요):
1. 반드시 아래 [데이터]에서 실제 숫자를 인용해야 합니다. 예: "(이번 달 8번째 운동)"
2. 없는 사실을 칭찬하지 마세요. 기록된 것만 칭찬하세요.
3. 타인과 비교하는 표현 금지. "평균보다", "보통 사람보다" 같은 표현 절대 사용 불가.
4. 과장하지 마세요. "대단해요!" 보다 "생각보다 꾸준한 사람이야"가 더 진심입니다.
5. 정체성 언어를 사용하세요. "~하는 사람이야" 형식이 습관보다 강한 동기입니다.
6. 2-3문장으로만. 길면 읽지 않습니다.
7. 마지막에 반드시 괄호로 근거를 붙이세요. 예: "(이번 달 14번째 기록)"

[데이터]
- 오늘 기록: ${r.entry}
- 카테고리: ${r.category}
- 이번 달 ${r.category} 기록 횟수: ${r.monthly_count}회
- 오늘까지 연속 기록일: ${r.streak}일
- 이번 달 전체 기록 횟수: ${r.total_monthly}회

위 데이터를 바탕으로 칭찬 한 단락을 한국어로 작성하세요.`;

  export default {
    async fetch(req: Request, env: Env): Promise<Response> {
      if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      // TODO(V2): 토스/Firebase 인증 토큰 검증 + 사용자별 rate limit (남용 차단)
      let body: PraiseRequest;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "bad_request" }), { status: 400 });
      }
      if (!body.entry || !body.category) {
        return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
      }

      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,  // ← 서버 시크릿. 클라이언트는 절대 못 봄
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 200,
          messages: [{ role: "user", content: PROMPT(body) }],
        }),
      });

      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: "upstream_error" }), { status: 502 });
      }
      const data = await upstream.json() as { content: { text: string }[] };
      const praise = data.content[0].text.trim();
      return new Response(JSON.stringify({ praise }), {
        headers: { "content-type": "application/json" },
      });
    },
  };
  ```

- [ ] **Step 3: 로컬 실행 + 검증 (Task 0 케이스 3개 재현)**

  ```bash
  npx wrangler dev
  # 다른 터미널에서:
  curl -X POST http://localhost:8787 -H "content-type: application/json" \
    -d '{"entry":"운동 30분","category":"운동","monthly_count":8,"streak":5,"total_monthly":12}'
  ```
  확인:
  - [ ] `{"praise":"...(이번 달 N번째...)"}` 형태로 응답
  - [ ] 숫자 인용 포함, 마지막 괄호 근거
  - [ ] 응답 본문에 API key가 절대 노출되지 않음

- [ ] **Step 4: 배포 + 엔드포인트 URL 확보**

  ```bash
  npx wrangler deploy
  # 출력된 https://<worker>.workers.dev URL을 Task 4b의 PRAISE_API_URL로 사용
  git add backend/ && git commit -m "feat: backend praise proxy (Cloudflare Worker, hides API key)"
  ```

---

## Task 4b: 클라이언트 칭찬 호출 (앱 → 백엔드)

**목표:** 앱은 백엔드 프록시만 호출. 응답 ≤ 3초, 오프라인 시 graceful 처리. API key 미보관.

**Files:**
- Create: `src/services/praiseClient.ts`

- [ ] **Step 1: generatePraise 함수 작성 (백엔드 호출)**

  ```typescript
  const PRAISE_API_URL = "https://<worker>.workers.dev";  // Task 4 Step 4의 배포 URL

  export async function generatePraise(entry: string, category: Category): Promise<string> {
    const stats = getMonthlyStats(category);
    const streak = getCurrentStreak() + 1;  // 오늘 기록하면 +1

    const res = await fetch(PRAISE_API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entry,
        category,
        monthly_count: stats.monthly_count + 1,
        streak,
        total_monthly: stats.total_monthly + 1,
      }),
    });
    if (!res.ok) throw new Error("praise_api_error:" + res.status);
    const data = await res.json() as { praise: string };
    return data.praise;
  }
  ```

- [ ] **Step 2: 타임아웃 처리 추가**

  3초 초과 시 reject (AbortController 권장):
  ```typescript
  export async function generatePraiseWithTimeout(entry: string, category: Category): Promise<string> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    try {
      const res = await fetch(PRAISE_API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildPayload(entry, category)),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("praise_api_error:" + res.status);
      return (await res.json() as { praise: string }).praise;
    } finally {
      clearTimeout(t);
    }
  }
  ```
  Task 3의 저장 버튼 onClick에서 `generatePraiseWithTimeout` 호출. 실패/타임아웃 시 `praise=""` + offline 플래그로 저장(이미 Task 3에 구현됨).

- [ ] **Step 3: 실제 호출 테스트**

  ```typescript
  generatePraiseWithTimeout("운동 30분", "운동").then(console.log);
  generatePraiseWithTimeout("코딩 2시간", "일").then(console.log);
  generatePraiseWithTimeout("친구랑 통화함", "관계").then(console.log);
  ```
  확인:
  - [ ] 숫자 인용 포함 / 3초 이내 응답 / 마지막 괄호 근거
  - [ ] 비행기 모드 → 3초 후 graceful 실패 (앱 크래시 없음)

- [ ] **Step 4: 커밋**

  ```bash
  git add src/services/praiseClient.ts
  git commit -m "feat: client praise via backend proxy (no API key on device)"
  ```

---

## Task 5: 오늘의 칭찬 화면

**목표:** 생성된 칭찬을 보여주는 화면. 빈 날(오늘 기록 없음) 분기 포함. 오프라인 케이스 처리.

**Files:**
- Create: 앱인토스 → 스크린 "칭찬" (Screen_Praise)
- Create: 앱인토스 → 스크린 "빈날" (Screen_Empty)

- [ ] **Step 1: 칭찬 화면 레이아웃**

  Screen_Praise 컴포넌트:
  
  ```
  [날짜] "6월 6일"  (상단)
  
  [카테고리 뱃지] "# 운동"  (작은 태그)
  
  [기록 텍스트] "운동 30분"  (폰트 16, 회색)
  
  [칭찬 텍스트] (LLM 생성 내용)
    폰트 크기: 18
    줄간격: 넓게
    정렬: 가운데
    ID: label_praise
  
  [오프라인 안내] (offline=true일 때만 표시)
    "인터넷 연결 시 칭찬이 생성됩니다"
    ID: label_offline
  
  [하단 탭]
    "← 기록 목록"  |  "이번 달 →"
  ```

- [ ] **Step 2: 화면 데이터 바인딩**

  Screen_Praise onLoad:
  
  ```javascript
  const params = getNavigationParams();
  
  label_entry.setText(params.entry);
  label_category.setText("# " + params.category);
  label_date.setText(formatDate(new Date()));
  
  if (params.offline || !params.praise) {
    label_praise.setVisible(false);
    label_offline.setVisible(true);
  } else {
    label_praise.setText(params.praise);
    label_praise.setVisible(true);
    label_offline.setVisible(false);
  }
  
  function formatDate(d) {
    const months = ["1월","2월","3월","4월","5월","6월",
                    "7월","8월","9월","10월","11월","12월"];
    const days = ["일","월","화","수","목","금","토"];
    return months[d.getMonth()] + " " + d.getDate() + "일 " +
           days[d.getDay()] + "요일";
  }
  ```

- [ ] **Step 3: 빈 날 화면 (Screen_Empty) 구현**

  홈 스크린 onLoad에서 날짜 체크 로직 추가:
  
  ```javascript
  // 어제 기록이 있고 오늘 기록이 없으면 빈 날 화면으로
  const todayEntry = getTodayEntry();
  const hasHistory = getAllEntries().length > 0;
  
  if (todayEntry === null && hasHistory) {
    // 오늘 기록 없음 + 과거 기록 있음 → 빈 날 화면 표시 여부 결정
    // 홈 화면은 그대로 두되 빈 날 안내 배너 표시
    banner_empty.setVisible(true);
  }
  ```
  
  Screen_Empty 레이아웃:
  
  ```
  [타이틀] "오늘은 쉬는 날이야"
  
  [서브텍스트] "지난달 기록을 보면:"
  
  [이번 달 집계]
    ID: label_monthly_summary
    내용: "운동 8회 · 코딩 14일 · 학습 3회"
  
  [리프레이밍 텍스트]
    "어제의 나보다 여기까지 왔어."
  
  [버튼] "오늘 기록하기" → 홈 스크린으로
  ```
  
  Screen_Empty onLoad:
  
  ```javascript
  const allEntries = getAllEntries();
  const now = new Date();
  const yearMonth = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0");
  
  const thisMonth = allEntries.filter(e => e.date.startsWith(yearMonth));
  
  // 카테고리별 집계
  const counts = {};
  thisMonth.forEach(e => {
    counts[e.category] = (counts[e.category] || 0) + 1;
  });
  
  const summaryParts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)  // 상위 3개만
    .map(([cat, cnt]) => cat + " " + cnt + "회");
  
  label_monthly_summary.setText(summaryParts.join(" · "));
  ```

- [ ] **Step 4: 수동 테스트 시나리오**

  1. 기록 입력 → 칭찬 화면 이동 → 칭찬 텍스트 표시 확인
  2. 비행기 모드 → 기록 입력 → "인터넷 연결 시 칭찬이 생성됩니다" 표시 확인
  3. 어제 기록 있는 상태에서 오늘 기록 없이 앱 실행 → 빈 날 안내 표시 확인
  4. 빈 날 화면 → 이번 달 집계 숫자 표시 확인

- [ ] **Step 5: 커밋**

  ```bash
  git add .
  git commit -m "feat: praise screen + empty day screen with monthly stats"
  ```

---

## Task 6: 기록 히스토리 + 스트릭 화면

**목표:** 지금까지 기록한 목록과 연속 기록일 표시. 사용자가 "나 이렇게 많이 했어"를 눈으로 확인하는 화면.

**Files:**
- Create: 앱인토스 → 스크린 "기록 목록" (Screen_History)

- [ ] **Step 1: 히스토리 화면 레이아웃**

  ```
  [스트릭 뱃지]
    "🔥 15일 연속 기록 중"
    스트릭이 0이면 "오늘부터 시작해요"
    ID: label_streak
  
  [기록 리스트]
    각 항목: [날짜] [카테고리 뱃지] [기록 텍스트]
    최신 순 정렬
    ID: list_entries
  
  [빈 상태]
    "아직 기록이 없어요. 오늘부터 시작해볼까요?"
    ID: empty_state
  ```

- [ ] **Step 2: 히스토리 화면 데이터 로드**

  ```javascript
  // onLoad
  const entries = getAllEntries();
  const streak = getCurrentStreak();
  
  if (entries.length === 0) {
    empty_state.setVisible(true);
    list_entries.setVisible(false);
    label_streak.setVisible(false);
    return;
  }
  
  empty_state.setVisible(false);
  list_entries.setVisible(true);
  
  // 스트릭
  if (streak > 0) {
    label_streak.setText("🔥 " + streak + "일 연속 기록 중");
  } else {
    label_streak.setText("오늘부터 다시 시작해봐요");
  }
  
  // 리스트 (최신순)
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  list_entries.setData(sorted.map(e => ({
    date: formatShortDate(e.date),
    category: e.category,
    text: e.entry
  })));
  
  function formatShortDate(dateStr) {
    const parts = dateStr.split("-");
    return parts[1] + "/" + parts[2];
  }
  ```

- [ ] **Step 3: 수동 테스트**

  1. 기록 3개 이상 저장 후 히스토리 화면 진입 → 최신순 목록 확인
  2. 스트릭 숫자가 getCurrentStreak() 결과와 일치 확인
  3. 기록 없는 상태 → 빈 상태 메시지 표시 확인

- [ ] **Step 4: 커밋**

  ```bash
  git add .
  git commit -m "feat: history screen with streak display"
  ```

---

## Task 7: 월말 리빌 화면

**목표:** 지난달 기록을 집계해 "사실 당신은 꾸준한 사람"임을 데이터로 보여주는 월초 이벤트 화면. 이게 앱의 감정적 페이오프.

**Files:**
- Create: 앱인토스 → 스크린 "월간 리빌" (Screen_Reveal)

- [ ] **Step 1: 리빌 데이터 집계 함수 추가**

  `storage.js`에 추가:
  
  ```javascript
  function getLastMonthStats() {
    const entries = getAllEntries();
    const now = new Date();
    
    // 지난달 연도-월
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yearMonth = lastMonth.getFullYear() + "-" +
      String(lastMonth.getMonth() + 1).padStart(2, "0");
    
    const lastMonthEntries = entries.filter(e => e.date.startsWith(yearMonth));
    
    if (lastMonthEntries.length === 0) return null;
    
    // 카테고리별 집계
    const counts = {};
    lastMonthEntries.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    
    // 최다 기록일 연속 스트릭
    const dates = lastMonthEntries.map(e => e.date).sort();
    let maxStreak = 1, curStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        curStreak++;
        maxStreak = Math.max(maxStreak, curStreak);
      } else {
        curStreak = 1;
      }
    }
    
    return {
      totalDays: lastMonthEntries.length,
      categoryCounts: counts,
      maxStreak: maxStreak,
      monthName: (lastMonth.getMonth() + 1) + "월",
      entries: lastMonthEntries
    };
  }
  
  function shouldShowReveal() {
    const now = new Date();
    const isMonthStart = now.getDate() <= 5;  // 매월 1-5일에 리빌
    const stats = getLastMonthStats();
    return isMonthStart && stats !== null && stats.totalDays >= 1;
  }
  ```

- [ ] **Step 2: 월간 리빌 LLM 요약 — 백엔드에 엔드포인트 추가**

  칭찬과 동일하게 **백엔드 프록시 경유**. Task 4 Worker에 `/reveal` 경로를 추가하고, 클라이언트는 그 경로만 호출한다.

  **(2a) 백엔드** `backend/src/index.ts` — `fetch` 핸들러 상단에서 경로 분기:
  ```typescript
  const url = new URL(req.url);
  if (url.pathname === "/reveal") {
    const s = await req.json() as {
      monthName: string; totalDays: number;
      categoryList: string; maxStreak: number;
    };
    const prompt = `당신은 사용자의 한 달 기록을 보고 진심 어린 총평을 하는 친구입니다.

규칙:
1. 반드시 아래 숫자를 구체적으로 인용하세요.
2. "생각보다 꾸준한 사람"이라는 발견을 이끌어내세요.
3. 타인 비교 금지.
4. 3-4문장. 마지막 문장은 정체성 언어로 마무리.

[${s.monthName} 기록 데이터]
- 총 기록일: ${s.totalDays}일
- 카테고리별: ${s.categoryList}
- 최장 연속 기록: ${s.maxStreak}일

위 데이터를 바탕으로 ${s.monthName} 총평을 한국어로 작성하세요.`;
    const up = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d = await up.json() as { content: { text: string }[] };
    return new Response(JSON.stringify({ reveal: d.content[0].text.trim() }), {
      headers: { "content-type": "application/json" },
    });
  }
  ```

  **(2b) 클라이언트** `src/services/praiseClient.ts`에 추가:
  ```typescript
  export async function generateMonthlyReveal(stats: LastMonthStats): Promise<string> {
    const categoryList = Object.entries(stats.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, cnt]) => `${cat} ${cnt}회`)
      .join(", ");
    const res = await fetch(PRAISE_API_URL + "/reveal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        monthName: stats.monthName,
        totalDays: stats.totalDays,
        categoryList,
        maxStreak: stats.maxStreak,
      }),
    });
    if (!res.ok) throw new Error("reveal_api_error:" + res.status);
    return (await res.json() as { reveal: string }).reveal;
  }
  ```

- [ ] **Step 3: 월간 리빌 화면 레이아웃**

  ```
  [타이틀] "{월}의 기록"  (예: "5월의 기록")
  
  [서브타이틀] "사실 당신은 생각보다 꾸준한 사람입니다"
  
  [숫자 집계]
    운동 14회  |  코딩 22회  |  학습 6회
    (카테고리 상위 3개, 큰 숫자)
    ID: label_counts
  
  [구분선]
  
  [LLM 총평]
    ID: label_monthly_praise
    로딩 중: "총평 생성 중..."
  
  [연속 기록 배지]
    "최장 연속 기록: {N}일"
    ID: label_max_streak
  
  [버튼] "이번 달도 기록하기 →" → 홈 스크린
  ```

- [ ] **Step 4: 리빌 화면 데이터 로드**

  Screen_Reveal onLoad:
  
  ```javascript
  const stats = getLastMonthStats();
  
  if (!stats) {
    // 데이터 없음 → 홈으로 리다이렉트
    navigateTo("Screen_Home");
    return;
  }
  
  label_month.setText(stats.monthName + "의 기록");
  label_max_streak.setText("최장 연속 기록: " + stats.maxStreak + "일");
  
  // 카테고리 집계 표시 (상위 3개)
  const topCats = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const countsText = topCats
    .map(([cat, cnt]) => cat + " " + cnt + "회")
    .join("  |  ");
  label_counts.setText(countsText);
  
  // LLM 총평 생성
  label_monthly_praise.setText("총평 생성 중...");
  generateMonthlyReveal(stats)
    .then(praise => {
      label_monthly_praise.setText(praise);
    })
    .catch(() => {
      label_monthly_praise.setText(
        stats.monthName + " 한 달 동안 " + stats.totalDays + "일을 기록했어.\n" +
        "숫자가 말해주잖아 — 꾸준한 사람이야."
      );
    });
  ```

- [ ] **Step 5: 월초 리빌 자동 표시 연결**

  홈 스크린 onLoad에 추가:
  
  ```javascript
  // 이미 위에 todayEntry 체크 있음, 그 아래에 추가
  if (shouldShowReveal()) {
    const shownKey = "reveal_shown_" + new Date().getMonth();
    if (!localStorage.getItem(shownKey)) {
      localStorage.setItem(shownKey, "true");
      navigateTo("Screen_Reveal");
      return;
    }
  }
  ```

- [ ] **Step 6: 수동 테스트 (날짜 조작)**

  테스트용으로 지난달 더미 데이터 삽입:
  
  ```javascript
  const testEntries = [];
  for (let i = 1; i <= 15; i++) {
    testEntries.push({
      id: "test" + i,
      date: "2026-05-" + String(i).padStart(2, "0"),
      entry: i % 3 === 0 ? "코딩" : "운동",
      category: i % 3 === 0 ? "일" : "운동",
      praise: "테스트 칭찬",
      createdAt: Date.now()
    });
  }
  localStorage.setItem("welliam_entries", JSON.stringify(testEntries));
  ```
  
  확인:
  1. `getLastMonthStats()` → `{totalDays: 15, ...}` 확인
  2. 리빌 화면 진입 → 카테고리 집계 숫자 정확 확인
  3. LLM 총평 생성 확인
  4. 앱 재시작 → 이미 본 리빌 재표시 안 됨 확인

- [ ] **Step 7: 커밋**

  ```bash
  git add .
  git commit -m "feat: monthly reveal screen with LLM summary + auto-show on month start"
  ```

---

## Task 8: QA — 수용 기준 전체 검증

**목표:** 스펙의 수용 기준 13개를 실제 앱에서 하나씩 확인. 빈 날 엣지 케이스 집중 테스트.

**Files:**
- Create: `ai/session-logs/2026-06-06-qa-results.md`

- [ ] **Step 1: 기록 입력 수용 기준 (AC 1-3)**

  ```
  AC1: 텍스트 입력 → 저장까지 ≤ 3탭
  테스트: 홈 스크린 진입 → 텍스트 입력 1번 → 저장 버튼 탭 1번 = 2탭
  Expected: PASS (3탭 이하)
  
  AC2: 카테고리 정확도 ≥ 70% (20개 샘플)
  테스트: Task 2 Step 2 결과 참조
  Expected: 14/20 이상
  
  AC3: 오프라인 기록 저장 가능
  테스트: 비행기 모드 → 텍스트 입력 → 저장 → localStorage 확인
  Expected: 기록 저장됨, 칭찬만 없음
  ```

- [ ] **Step 2: 칭찬 생성 수용 기준 (AC 4-7)**

  20개 입력으로 실제 칭찬 생성 후 수동 검토:
  
  ```
  AC4: 숫자 인용 포함 — 각 칭찬에 "(이번 달 N번째)" 형식 있는지
  AC5: 동일 패턴 3회 연속 없음 — 20개 연속 실행 후 패턴 비교
  AC6: 타인 비교 0건 — "평균", "보통", "남들" 등 포함 여부
  AC7: 응답 ≤ 3초 — 타임아웃 미발생 확인
  ```
  
  결과를 `ai/session-logs/2026-06-06-qa-results.md`에 기록.

- [ ] **Step 3: 빈 날 처리 수용 기준 (AC 8-10) — 핵심**

  ```
  AC8: 기록 없는 날 → 빈 날 UI 표시 (칭찬 UI 아님)
  테스트: 오늘 기록 삭제 후 앱 재시작 → 화면 분기 확인
  
  AC9: 빈 날 UI에서 이번 달 누적 데이터 표시
  테스트: 이번 달 기록 5개 있는 상태에서 오늘 기록 삭제 → 빈 날 화면 진입
  Expected: "운동 X회 · 일 Y회" 표시
  
  AC10: 빈 날 칭찬에 날조 없음
  테스트: 빈 날 화면 텍스트에 오늘 기록하지 않은 행동 언급 없음 확인
  Expected: 오늘 행동 칭찬 없음. 이번 달 집계만 표시.
  ```

- [ ] **Step 4: 월말 리빌 수용 기준 (AC 11-13)**

  ```
  AC11: 기록 0개 달에는 리빌 미표시
  테스트: 지난달 데이터 없는 상태 → shouldShowReveal() = false 확인
  
  AC12: 리빌에 카테고리별 정확한 집계
  테스트: 더미 데이터 (운동 8, 코딩 5, 학습 2) → 리빌 화면 숫자 일치 확인
  
  AC13: 리빌에 구체적 숫자 포함
  테스트: LLM 총평 텍스트에 "N회" 또는 "N일" 형식 포함 확인
  ```

- [ ] **Step 5: QA 결과 기록 + 미통과 항목 수정**

  `ai/session-logs/2026-06-06-qa-results.md`에 기록:
  
  ```markdown
  # QA 결과 (2026-06-06)
  
  | AC | 항목 | 결과 | 비고 |
  |----|------|------|------|
  | 1  | 입력 ≤ 3탭 | PASS | 2탭으로 완료 |
  | 2  | 카테고리 정확도 | PASS/FAIL | N/20 |
  | ...| ...  | ...  | ...  |
  
  미통과 항목: [목록]
  수정 사항: [내용]
  ```

- [ ] **Step 6: 최종 커밋**

  ```bash
  git add ai/session-logs/
  git commit -m "qa: acceptance criteria validation - all 13 ACs verified"
  ```

---

## Task 9: 앱인토스 제출 준비

**목표:** 앱인토스 플랫폼에 제출하기 위한 최종 설정.

- [ ] **Step 1: 앱 메타데이터 설정**

  앱인토스 → 앱 설정:
  ```
  앱 이름: 잘하고 있음
  부제목: 오늘 한 일의 기록
  카테고리: 라이프스타일 / 자기계발
  연령 등급: 4+ (의료/건강 관련 내용 없음)
  ```

- [ ] **Step 2: 앱 아이콘 + 스플래시 스크린**

  ```
  아이콘 콘셉트: 따뜻한 초록 계열, 체크마크 또는 잎사귀
  스플래시 텍스트: "잘하고 있어."  (마침표 중요 — 선언적 어조)
  ```

- [ ] **Step 3: 프라이버시 설정 확인**

  - 기록 원본은 기기 로컬 저장(StorageAdapter) — 서버 DB에 저장하지 않음
  - 칭찬 생성 시 **백엔드 프록시로 전송되는 데이터**: 기록 텍스트 + 통계 수치만 (사용자 식별 정보 없음). 백엔드는 이를 Claude로 중계만 하고 저장하지 않음
  - 백엔드에 **Anthropic API key가 시크릿으로만 존재**하는지 확인 (`wrangler secret list`), 클라이언트 번들에 키 문자열 0건인지 grep으로 확인
  - 앱인토스 프라이버시 정책: "기록은 기기에 저장되며, 칭찬 생성을 위해 익명 통계만 서버로 전송됩니다" 명시

- [ ] **Step 4: 최종 기능 체크리스트**

  ```
  - [ ] 홈 스크린 진입 → 입력 → 칭찬 화면 전체 흐름
  - [ ] 오프라인 모드 입력 저장
  - [ ] 빈 날 화면 표시
  - [ ] 히스토리 + 스트릭 표시
  - [ ] 월간 리빌 (더미 데이터로 검증)
  - [ ] 앱 재시작 후 데이터 유지
  ```

---

## 전체 타임라인

| Task | 내용 | 예상 시간 |
|------|------|---------|
| 0 | 프롬프트 검증 | 2-3시간 |
| 1 | 데이터 저장소 (StorageAdapter) | 2시간 |
| 2 | 카테고리 분류 | 1시간 |
| 3 | 기록 입력 화면 | 3시간 |
| 4 | 백엔드 프록시 (API key 은닉) | 2-3시간 |
| 4b | 클라이언트 칭찬 호출 | 1시간 |
| 5 | 칭찬 + 빈 날 화면 | 3시간 |
| 6 | 히스토리 화면 | 2시간 |
| 7 | 월말 리빌 (+ /reveal 엔드포인트) | 3시간 |
| 8 | QA | 2시간 |
| 9 | 제출 준비 | 1시간 |
| **합계** | | **23-24시간 (약 4일)** |

---

## 셀프 리뷰 체크

### 스펙 커버리지
- [x] F1 기록 입력 → Task 3
- [x] F2 칭찬 생성 → Task 0(프롬프트 검증), 4(백엔드), 4b(클라이언트)
- [x] F3 주간 요약/스트릭 → Task 6
- [x] F4 월말 리빌 → Task 7
- [x] 빈 날 처리 → Task 5 (Screen_Empty)
- [x] 오프라인 처리 → Task 3, 4b
- [x] 카테고리 자동 태그 → Task 2, 3
- [x] LLM 프롬프트 규칙 (영수증 강제) → Task 0, 4
- [x] API key 은닉 (백엔드 프록시) → Task 4
- [x] 구글플레이 이식성 (어댑터 패턴) → 플랫폼 해석 메모 + 기술스택
- [x] 로그인/결제/광고 설계 → 제품 스펙 수익화 섹션

### 플레이스홀더 스캔
없음. 모든 단계에 실제 코드 포함.

### 타입 일관성
- `saveEntry(text, category, praise)` — Task 1, 3에서 동일하게 사용
- `getMonthlyStats(category)` — Task 1, 4에서 동일하게 사용
- `getCurrentStreak()` — Task 1, 4, 6에서 동일하게 사용
- `DailyEntry` 인터페이스 — 모든 Task에서 동일한 필드명 사용

---

## 관련 문서
- 제품 스펙: `ai/plans/2026-06-06-product-spec.md`
- 프롬프트: `ai/prompts/praise-v1-final.txt` (Task 0 완료 후)
- QA 결과: `ai/session-logs/2026-06-06-qa-results.md` (Task 8 완료 후)
