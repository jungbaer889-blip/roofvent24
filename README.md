# 루프벤트 — roofvent24.com

옥상 무동력 벤츄레이터(옥상 환풍기) 교체·설치 전문 사이트.
정적 HTML 생성 방식입니다. `build.mjs` 가 JSON 데이터를 읽어 `dist/` 에 완성된 HTML을 만듭니다.

---

## 1. 지금 만들어진 것 — 총 51페이지

| 페이지 | 주소 | 개수 |
|---|---|---|
| 메인 | `/` | 1 |
| 교체·설치 허브 | `/vent/` | 1 |
| 취급 규격 | `/vent/spec/` | 1 |
| 정보성 가이드 | `/vent/guides/{slug}/` | 10 |
| **지역별 안내** | `/vent/regions/{slug}/` | **36** |
| 시공 사례 | `/cases/` | 1 |
| 문의 | `/contact/` | 1 |

지역 36곳 = 서울 25개 구 + 인천 8개 구 + 부천 3개 구

이 밖에 `sitemap.xml`, `robots.txt`, `rss.xml`, `404.html`,
그리고 **`urls.txt`**(네이버 서치어드바이저 수집요청용 전체 URL 목록)가 함께 생성됩니다.

---

## 2. 빌드하기

```bash
npm run build      # dist/ 에 51페이지 생성
```

Node 18 이상이면 됩니다. 외부 패키지를 쓰지 않아 `npm install` 은 필요 없습니다.

로컬에서 확인하려면:

```bash
npx serve dist     # 또는 python -m http.server 8000 -d dist
```

---

## 3. 배포 (장판픽스와 동일한 방식)

1. **GitHub** — 이 폴더를 비공개 저장소로 올립니다. (`dist/` 는 `.gitignore` 에 있어 올라가지 않습니다)
2. **Vercel** — 저장소를 Import 합니다. `vercel.json` 에 빌드 설정이 들어 있어 그대로 두면 됩니다.
   - Build Command: `node build.mjs`
   - Output Directory: `dist`
3. **가비아 DNS** — Vercel이 알려주는 값을 그대로 넣습니다.
   - `A` 레코드 `@` → Vercel이 안내하는 IP
   - `CNAME` 레코드 `www` → Vercel이 안내하는 주소
4. Vercel 프로젝트에 도메인 `roofvent24.com` 과 `www.roofvent24.com` 을 등록합니다.

---

## 4. 배포 직후 반드시 할 것

### 소유확인 코드 넣기
`site.config.mjs` 를 열어 두 줄을 채우고 다시 배포하세요.

```js
naverVerification: '여기에 네이버 코드',
googleVerification: '여기에 구글 코드',
```

- 네이버 서치어드바이저 → 사이트 등록 → HTML 태그 방식 → `content` 값만 복사
- 구글 서치콘솔 → 소유권 확인 → HTML 태그 방식 → `content` 값만 복사

### 사이트맵 제출
- 네이버 서치어드바이저 → 사이트맵 제출 → `https://roofvent24.com/sitemap.xml`
- 구글 서치콘솔 → Sitemaps → `sitemap.xml`

### 수집요청 (네이버는 이게 제일 중요합니다)
빌드하면 `dist/urls.txt` 에 51개 주소가 전부 들어 있습니다.
네이버 서치어드바이저 → 요청 → 웹 페이지 수집 에 하루 몇 개씩 나눠 넣으세요.
**메인 → 허브 → 지역 페이지** 순서로 넣는 편이 낫습니다.

### 사업자 정보 채우기
`site.config.mjs` 의 `ceo`(대표자명), `bizNo`(사업자등록번호)를 채우면 푸터에 표시됩니다.
비워두면 아예 표시되지 않으니 지금 상태로도 문제는 없습니다.

---

## 5. 내용 고치는 법

### 지역 페이지 내용 수정
`src/data/regions-1.json` ~ `regions-6.json`

한 지역은 이렇게 생겼습니다.

```json
{
  "slug": "gangseo",           // 주소가 됩니다 → /vent/regions/gangseo/
  "name": "강서구",
  "city": "서울",
  "title": "강서구 옥상 환풍기 교체·벤츄레이터 설치 | 루프벤트",   // 검색결과 제목
  "description": "...",        // 검색결과 설명문
  "h1": "강서구 옥상 환풍기·벤츄레이터 교체 설치",
  "lead": "...",               // 첫 화면 소개 문단
  "sections": [ { "h2": "소제목", "html": "<p>본문</p>" } ],
  "faq": [ { "q": "질문", "a": ["답변1", "답변2"] } ]
}
```

> **중요** — 지역 페이지는 서로 문장이 겹치면 검색엔진에서 유사문서로 걸립니다.
> 문장을 고칠 때 다른 지역에서 복사해 지역명만 바꾸지 마세요.

### 지역 추가하기 (2차 오픈: 경기 나머지 지역)
1. `src/data/regions-7.json` 을 만들고 위 형식으로 지역들을 넣습니다.
2. `src/data/regions.mjs` 의 `FILES` 배열에 `'regions-7.json'` 을 추가합니다.
3. `npm run build` — 메뉴·칩·사이트맵에 자동으로 붙습니다.

### 가이드 글 수정
`src/data/guides-a.json`, `guides-b.json` (10편)

### 회사 정보·전화번호·메뉴
`site.config.mjs` 한 곳에서 전부 바뀝니다.

### 디자인
`public/styles.css` — 맨 위 `:root` 의 색상 변수만 바꿔도 톤이 전체적으로 바뀝니다.

---

## 6. 시공 사진 추가하는 법 ★

지금은 강서구 화곡동 1건만 들어가 있습니다. 사진이 늘수록 지역 페이지가 강해집니다.

**1) 사진 파일을 이 규칙대로 넣습니다**

```
public/img/cases/case02-before.webp
public/img/cases/case02-after.webp
public/img/cases/case03-before.webp
public/img/cases/case03-after.webp
...
```

- 번호는 두 자리(`01`, `02`, …), 전/후 한 쌍이 반드시 같이 있어야 합니다.
- 정사각형 1100×1100 으로 잘라 넣으면 화면에 딱 맞습니다.
- `.webp` 로 변환해야 페이지가 빠릅니다. (jpg를 그대로 쓰면 사진 한 장이 3MB씩 되어 모바일에서 느려집니다)

**2) `src/data/cases.mjs` 에 한 줄 추가합니다**

```js
c(2, '교체', '제목', '설명 문장', '인천 남동구 구월동', 'incheon-namdong', '450파이'),
//  ↑번호 ↑작업유형          ↑표시될 지역명        ↑지역 slug        ↑규격
```

지역 slug 를 채우면 **그 지역 페이지 맨 앞에 이 사례가 뜹니다.**
(slug 는 `regions-*.json` 의 `slug` 값과 똑같이 적어야 합니다)

**3) `npm run build`** — 메인·허브·사례·지역 페이지에 자동으로 붙습니다.

원본 사진은 바탕화면 `루트벤트홈페이지\<구 이름>\` 폴더에 지금처럼
`지역-동-작업내용-대수-전.jpg` / `-후.jpg` 형식으로 모아두시면
나중에 한 번에 변환해서 넣기 좋습니다.

---

## 7. 폴더 구조

```
roofvent/
├─ build.mjs              페이지 생성 스크립트
├─ site.config.mjs        ★ 회사정보·전화번호·메뉴·소유확인코드
├─ vercel.json            Vercel 빌드 설정
├─ public/
│  ├─ styles.css          ★ 디자인
│  └─ img/
│     ├─ og-default.jpg   카톡·검색 공유 이미지
│     └─ cases/           ★ 시공 전·후 사진
├─ src/
│  ├─ templates.mjs       공통 레이아웃·구조화데이터(JSON-LD)
│  └─ data/
│     ├─ regions-1~6.json ★ 지역 36곳 내용
│     ├─ guides-a,b.json  ★ 가이드 10편
│     └─ cases.mjs        ★ 시공 사례 목록
└─ dist/                  생성 결과 (git에 올리지 않음)
```
