import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

// 지역 데이터는 파일 여러 개로 나눠 관리합니다. 지역을 추가하려면
// regions-10.json 처럼 파일을 만들고 아래 배열에 파일명만 추가하세요.
const FILES = [
  'regions-1.json', 'regions-2.json', 'regions-3.json',
  'regions-4.json', 'regions-5.json', 'regions-6.json',
  'regions-7.json', 'regions-8.json', 'regions-9.json',
];

// 부천 3개 구는 경기 그룹에 함께 묶어 보여줍니다.
const CITY_ALIAS = { '경기 부천': '경기' };

export const regions = FILES.flatMap(load)
  .map((r) => ({ ...r, city: CITY_ALIAS[r.city] || r.city }));

// 도시별 묶음 — 지역 칩을 그룹으로 보여줄 때 씁니다.
export const regionGroups = (() => {
  const order = ['서울', '인천', '경기'];
  const map = new Map(order.map((c) => [c, []]));
  for (const r of regions) {
    if (!map.has(r.city)) map.set(r.city, []);
    map.get(r.city).push(r);
  }
  return [...map.entries()].filter(([, list]) => list.length).map(([city, list]) => ({ city, list }));
})();
