# 칭찬해줘 명대사/명언 QuotePack 리서치 v0.1

작성일: 2026-06-07
상태: provisional
목적: `칭찬해줘` MVP의 5개 버튼에 맞는 드라마/영화/명언/밈 후보를 5개씩 찾고,
출시용 quote pack 검수 기준을 정한다.

정정: 이 문서 작성 당시 `멘탈 한마디`가 앱명 후보로 쓰였지만, 2026-06-08 기준 앱명은
`칭찬해줘`이다. `멘탈 한마디`는 제품 방향/카테고리 프레임 후보로만 남긴다.

## 전제

앱 방향:

- 앱명: `칭찬해줘`
- 버튼: `응원해줘!`, `진정시켜줘!`, `위로해줘!`, `괜찮다고 해줘!`, `잘했다고 해줘!`
- 재생 방식: ElevenLabs 등으로 미리 만든 오디오 파일을 앱에서 즉시 재생
- 앱 내 실시간 TTS/API 호출은 MVP에서 제외

중요한 결론:

- 명대사/명언 후보는 인터넷에서 충분히 찾을 수 있다.
- 하지만 `유명함`과 `앱에 탑재 가능함`은 다르다.
- 영화/드라마 대사, 밈, 짤 문구는 대부분 저작권/상표/초상권/번역권 검수가 필요하다.
- MVP 데이터에는 반드시 `rightsStatus`, `sourceType`, `riskLevel`, `audioStatus`를 둔다.
- 사용자 결정: 배우/캐릭터 목소리를 흉내 내지 않고, 실제 영화/드라마 음성 클립도 직접 넣지 않는다.
- 따라서 오디오 리스크는 낮아지며, 남는 핵심 검토 대상은 `텍스트 대사`, `번역`, `작품명/캐릭터명 사용`, `상표/브랜드 연상`이다.

## 선별 기준

각 후보는 아래 네 가지로 본다.

1. 멘탈 케어 역할이 분명한가?
2. 남녀노소가 이해할 만큼 짧고 직관적인가?
3. 음성으로 들었을 때 오글거리거나 공격적으로 들리지 않는가?
4. 권리 리스크를 감당할 수 있는가?

## QuotePack v0.1 후보

### 1. 응원해줘!

| 후보 | 출처/유형 | 멘탈 효과 | 리스크 |
| --- | --- | --- | --- |
| `Just keep swimming.` | 영화 `Finding Nemo` | 가볍고 반복 가능한 응원 | 높음: Disney IP |
| `May the Force be with you.` | 영화 `Star Wars` | 응원/축복/출발 신호 | 높음: Lucasfilm/Disney IP, 상표성 |
| `Carpe diem.` | 영화 `Dead Poets Society`/라틴어 격언 | 오늘을 붙잡는 에너지 | 중간: 표현 자체는 고전, 영화 맥락은 권리 검수 |
| `Keep moving forward.` | 영화 `Rocky Balboa` 계열 메시지 | 다시 움직이는 힘 | 높음: 영화 대사 맥락 |
| `Do what you can, with what you have, where you are.` | Theodore Roosevelt 명언 | 조건이 완벽하지 않아도 시작하게 함 | 낮음-중간: 명언 출처 검증 필요 |

판정:

- 앱 탑재 1순위 감각은 `Just keep swimming.`이다.
- 다만 권리 리스크가 높으므로, 출시용으로는 같은 정서의 오리지널 한국어 문장도 병행 후보로 만든다.

### 2. 진정시켜줘!

| 후보 | 출처/유형 | 멘탈 효과 | 리스크 |
| --- | --- | --- | --- |
| `Keep calm and carry on.` | 영국 전시 포스터/밈 | 짧고 즉각적인 안정감 | 낮음-중간: 역사 문구이나 상품화/상표 확인 필요 |
| `This too shall pass.` | 오래된 격언 | 지금 감정이 영원하지 않다는 안정 | 낮음 |
| `All is well.` | 영화 `3 Idiots` | 반복 가능한 자기진정 주문 | 중간: 짧은 표현이나 영화 맥락 |
| `Would it help?` | 영화 `Bridge of Spies` | 불안한 생각을 멈추는 짧은 질문 | 중간-높음: 영화 대사 |
| `Be a goldfish.` | 드라마 `Ted Lasso` 밈 | 실수/잡념을 흘려보내기 | 높음: Apple TV+ IP |

판정:

- `This too shall pass.`와 `Keep calm and carry on.`은 가장 안전하고 범용적이다.
- `All is well.`은 음성으로 들었을 때 버튼 앱과 궁합이 좋다.

### 3. 위로해줘!

| 후보 | 출처/유형 | 멘탈 효과 | 리스크 |
| --- | --- | --- | --- |
| `It's not your fault.` | 영화 `Good Will Hunting` | 죄책감/상처를 직접 내려놓게 함 | 높음: 영화 대사 |
| `Tomorrow is another day.` | 영화 `Gone with the Wind` | 하루를 넘기게 하는 희망 | 중간-높음: 영화 대사 |
| `You is kind. You is smart. You is important.` | 영화 `The Help` | 자기존중 회복 | 높음: 영화 대사, 번역/문체 이슈 |
| `행복하자.` | 드라마 `나의 아저씨` 계열로 소비되는 위로 문구 | 조용하고 깊은 위로 | 높음: 한국 드라마 대사 맥락 검수 필요 |
| `난 늘 당신 편이야.` | 관계/부부 설문에서 반복되는 듣고 싶은 말 | 외로움 완화, 지지감 | 낮음-중간: 일반 문구이나 출처/표현 검수 |

판정:

- 멘탈 케어 임팩트 1위는 `It's not your fault.`다.
- 한국어 앱 감성으로는 `행복하자.`와 `난 늘 당신 편이야.` 계열이 강하다.

### 4. 괜찮다고 해줘!

| 후보 | 출처/유형 | 멘탈 효과 | 리스크 |
| --- | --- | --- | --- |
| `Nobody's perfect.` | 영화 `Some Like It Hot` | 실수/불완전함을 받아들이게 함 | 중간-높음: 영화 대사이나 관용 표현성도 있음 |
| `It is possible to commit no mistakes and still lose.` | `Star Trek: The Next Generation` | 실패가 곧 잘못은 아님을 설명 | 높음: TV 대사, 길이도 김 |
| `실수해도 괜찮아.` | 고교생 설문에서 반복된 부모에게 듣고 싶은 말 | 자책 완화 | 낮음: 일반 문구 |
| `괜찮아, 사랑이야.` | 한국 드라마 제목/문구 | 즉시 이해되는 괜찮음 | 높음: 제목/상표/드라마 IP 확인 필요 |
| `The past can hurt. But you can either run from it, or learn from it.` | 영화 `The Lion King` | 과거 실수 재해석 | 높음: Disney IP, 길이 김 |

판정:

- 출시용 문장으로는 `실수해도 괜찮아.`가 가장 안전하다.
- 유명성/짤성은 `Nobody's perfect.`와 `괜찮아, 사랑이야.`가 강하다.

### 5. 잘했다고 해줘!

| 후보 | 출처/유형 | 멘탈 효과 | 리스크 |
| --- | --- | --- | --- |
| `That'll do.` | 영화 `Babe` | 조용한 인정/수고했다는 느낌 | 높음: 영화 대사, 원문 전체 사용은 주의 |
| `You did it.` | 영화 `Jurassic Park` 밈으로도 소비 | 성취 인정 | 중간-높음: 짧은 일반 표현이나 영화 밈 맥락 |
| `Well done is better than well said.` | Benjamin Franklin 명언 | 행동을 인정함 | 낮음: 고전 명언 |
| `You are braver than you believe.` | `Winnie the Pooh` 계열로 알려진 문구 | 스스로를 크게 보게 함 | 중간-높음: 출처/권리 확인 필요 |
| `수고했어.` | 서울시민/직장인 설문에서 반복된 듣고 싶은 말 | 노력 인정, 세대 보편성 | 낮음: 일반 문구 |

판정:

- 앱에서 가장 안전하고 강한 한국어 후보는 `수고했어.`다.
- 명대사 감각은 `That'll do.`가 있지만, 원문 전체를 쓰면 어색하거나 권리 리스크가 커진다.

## 권장 MVP 콘텐츠 전략

MVP는 두 레이어로 간다.

### Core Pack

- 앱 기본 25개
- 유명 명대사/명언에서 감정 구조를 가져오되, 권리 리스크가 낮은 문장을 우선 사용
- 안전한 일반 문구, 고전 명언, 격언 중심
- ElevenLabs 일반/라이선스 음성으로 생성
- 특정 배우, 캐릭터, 원작 음성을 흉내 내는 voice style은 금지

### Famous Pack

- 사용자가 원하는 진짜 명대사/밈/드라마 대사 후보
- `rightsStatus`가 `licensed`, `public_domain`, `owned`, `user_local`인 것만 앱에서 노출
- `unknown`은 기획 문서에만 보관하고 제품에는 탑재하지 않음
- 실제 영화/드라마 음성 클립은 제품에 탑재하지 않음

## 데이터 스키마 초안

```ts
type QuoteItem = {
  id: string;
  category:
    | "encourage"
    | "calm"
    | "comfort"
    | "reassure"
    | "recognize";
  buttonLabel:
    | "응원해줘!"
    | "진정시켜줘!"
    | "위로해줘!"
    | "괜찮다고 해줘!"
    | "잘했다고 해줘!";
  displayText: string;
  sourceTitle: string;
  sourceType: "movie" | "drama" | "quote" | "proverb" | "meme" | "survey" | "original";
  sourceUrl?: string;
  locale: "ko" | "en";
  localizedText?: string;
  rightsStatus: "public_domain" | "licensed" | "owned" | "common_phrase" | "unknown";
  riskLevel: "low" | "medium" | "high";
  audioPath?: string;
  audioStatus: "missing" | "generated" | "approved";
  audioPolicy: "neutral_generated_voice" | "licensed_voice" | "user_local_only";
  notes?: string;
};
```

## 다음 작업

1. 25개 후보 중 `high risk` 후보를 유지할지, 감정 구조만 빌려 오리지널 문장으로 바꿀지 결정한다.
2. 각 버튼별로 최종 5개를 골라 `quote-pack.v0.1.json`에 넣는다.
3. ElevenLabs에서 같은 화자/톤이 아니라 카테고리별 목소리 톤을 나눈다.
4. 오디오 파일명을 `category-index-source.wav` 규칙으로 정한다.
5. 앱 구현은 텍스트/오디오 manifest를 읽어 재생하는 구조로 바꾼다.

## 참고 출처

- AFI 100 Years...100 Movie Quotes: https://www.afi.com/afis-100-years-100-movie-quotes/
- IMDb Finding Nemo Quotes: https://www.imdb.com/title/tt0266543/quotes/
- IMDb Good Will Hunting Quotes: https://www.imdb.com/title/tt0119217/quotes/
- IMDb Some Like It Hot Quotes: https://www.imdb.com/title/tt0053291/quotes/
- IMDb Babe Quotes: https://www.imdb.com/title/tt0112431/quotes/
- IMDb Jurassic Park Quotes: https://www.imdb.com/title/tt0107290/quotes/
- Know Your Meme, Keep Calm and Carry On: https://knowyourmeme.com/memes/keep-calm-and-carry-on
- Keep Calm and Carry On official historical note, Imperial War Museums: https://www.iwm.org.uk/history/the-story-of-keep-calm-and-carry-on
- 연합뉴스, 서울시민 마음알기 조사: https://www.yna.co.kr/view/AKR20170930042700004
- 아주경제, 고교생이 부모에게 듣고 싶은 말 설문: https://www.ajunews.com/view/20150429094124060
- 잡코리아, 직장인이 회사에서 듣고 싶은 말: https://www.jobkorea.co.kr/goodjob/tip/view?News_No=15569
- 대한뉴스, 부부의 날 듣고 싶은 말 설문: https://daehannews.kr/mobile/article.html?no=506187
- U.S. Copyright Office, Fair Use FAQ: https://www.copyright.gov/help/faq/faq-fairuse.html
- U.S. Copyright Office, names/titles/short phrases: https://www.copyright.gov/circs/circ33.pdf
- ElevenLabs generated content publishing guidance: https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform
