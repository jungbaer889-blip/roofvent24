// 시공 사례 — 사진 2장 1세트 (시공 전 / 시공 후)
//
// ▶ 사진 파일 규칙
//    public/img/cases/caseNN-before.webp
//    public/img/cases/caseNN-after.webp   (NN = 01, 02, 03 …)
//
// ▶ 사례 추가하는 법
//    1) 사진 2장을 위 규칙대로 public/img/cases/ 에 넣습니다.
//    2) 아래 배열에 c(...) 한 줄을 추가합니다.
//    3) npm run build  →  메인·허브·사례·지역 페이지에 자동으로 붙습니다.
//
// ▶ c( 번호, 작업유형, 제목, 설명, 표시지역명, 지역slug, 규격 )
//    region slug 를 채우면 그 지역 페이지에서 맨 앞에 노출됩니다.
//    (지역 slug 는 src/data/regions-*.json 의 slug 값과 같아야 합니다)

const c = (n, type, title, desc, place = '', region = '', size = '') => ({
  id: `case${String(n).padStart(2, '0')}`,
  type, title, desc, place, region, size,
  before: `/img/cases/case${String(n).padStart(2, '0')}-before.webp`,
  after: `/img/cases/case${String(n).padStart(2, '0')}-after.webp`,
});

export const cases = [
  c(1, '교체', '녹슬어 주저앉은 후드와 좌대 일괄 교체',
    '상부 후드가 부식으로 찢어져 내려앉고 녹물이 좌대를 타고 흘러내린 상태였습니다. 후드와 좌대를 함께 걷어내고 300파이 벤츄레이터로 새로 앉혔습니다.',
    '서울 강서구 화곡동', 'gangseo', '300파이'),
];

// 페이지마다 다른 사례가 나오도록 고르는 함수
export function pickCases(count, offset = 0) {
  if (!cases.length) return [];
  return Array.from({ length: Math.min(count, cases.length) },
    (_, i) => cases[(offset + i) % cases.length]);
}

// 지역 페이지용 — 그 지역 사례를 맨 앞에 두고 나머지를 채웁니다.
export function pickCasesForRegion(slug, count = 3, offset = 0) {
  const own = cases.filter((x) => x.region === slug);
  const rest = cases.filter((x) => x.region !== slug);
  const out = [...own];
  for (let i = 0; out.length < count && i < rest.length; i++) {
    out.push(rest[(offset + i) % rest.length]);
  }
  return out.slice(0, Math.max(count, own.length));
}
