import fs from 'fs';
import path from 'path';
import { site } from './site.config.mjs';
import { guides } from './src/data/guides.mjs';
import { regions } from './src/data/regions.mjs';
import { cases, pickCases, pickCasesForRegion, ownCases } from './src/data/cases.mjs';
import {
  layout, ctaBand, faqBlock, regionChips, guideCards, breadcrumb, specTable,
  ldLocalBusiness, ldService, ldFAQ, ldBreadcrumb, ldArticle,
} from './src/templates.mjs';

const OUT = 'dist';
const pages = [];

function write(urlPath, html) {
  const dir = path.join(OUT, urlPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  pages.push(urlPath === '' ? '/' : `/${urlPath}/`.replace(/\/+/g, '/'));
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name); const d = path.join(to, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

/* ── 재사용 블록 ───────────────────────────── */

// 사진 alt — 지역명 + 핵심 검색어를 넣어 이미지 검색에도 걸리게 합니다.
function caseAlt(c, when) {
  return [c.place, '옥상 환풍기', c.size, `벤츄레이터 ${c.type}`, when]
    .filter(Boolean).join(' ');
}

// currentSlug: 지금 보고 있는 지역. 그 지역 사례는 자기 페이지로 다시 링크하지 않습니다.
function caseCard(c, eager = false, currentSlug = '') {
  const load = eager ? '' : ' loading="lazy"';
  const linked = c.region && c.region !== currentSlug;
  const region = linked ? regions.find((r) => r.slug === c.region) : null;
  const tag = linked ? 'a' : 'article';
  const attrs = linked
    ? ` class="case case-link" href="/vent/regions/${c.region}/"` : ' class="case"';
  return `<${tag}${attrs}>
    <div class="case-imgs">
      <figure><img src="${c.before}" alt="${caseAlt(c, '시공 전')}" width="1100" height="1100"${load} decoding="async"><figcaption class="tag-b">시공 전</figcaption></figure>
      <figure><img src="${c.after}" alt="${caseAlt(c, '시공 후')}" width="1100" height="1100"${load} decoding="async"><figcaption class="tag-a">시공 후</figcaption></figure>
    </div>
    <div class="case-head">
      <span class="type">${c.type}</span>${c.place ? `<span class="place">${c.place}</span>` : ''}${c.size ? `<span class="cspec">${c.size}</span>` : ''}
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      ${region ? `<span class="more">${region.name} 옥상 환풍기 안내 보기 →</span>` : ''}
    </div>
  </${tag}>`;
}

function caseSection(heading, list, lead, currentSlug = '', label = 'CASE') {
  if (!list.length) return '';
  return `<section id="cases"><div class="wrap">
  <div class="sec-label">${label}</div>
  <h2 class="sec">${heading}</h2>
  <p class="sec-lead">${lead}</p>
  <div class="cases${list.length === 1 ? ' cases-solo' : ''}">${list.map((c, i) => caseCard(c, i < 2, currentSlug)).join('')}</div>
</div></section>`;
}

const PROCESS = `<section><div class="wrap">
  <div class="sec-label">PROCESS</div>
  <h2 class="sec">진행 순서</h2>
  <p class="sec-lead">옥상 사진 한 장이면 시작됩니다. 방문 전에 교체가 필요한 상태인지, 무엇을 바꿔야 하는지 먼저 말씀드립니다.</p>
  <ol class="steps">
    <li><h4>사진·위치 전달</h4><p>지금 달려 있는 환풍기 사진 한 장과 건물 위치를 문자로 보내주세요. 옆에서 찍은 사진이 상태 확인에 가장 좋습니다.</p></li>
    <li><h4>상태 확인·안내</h4><p>교체가 필요한지, 좌대까지 손봐야 하는지, 어떤 규격이 맞는지 사진으로 먼저 판단해 알려드립니다.</p></li>
    <li><h4>현장 실측·일정</h4><p>개구부 치수와 옥상 접근 경로를 직접 확인하고 자재와 작업 일정을 맞춥니다.</p></li>
    <li><h4>시공·마무리</h4><p>기존 제품을 걷어내고 새로 앉힌 뒤, 고정과 마감을 확인하고 걷어낸 자재까지 정리해 내려옵니다.</p></li>
  </ol>
</div></section>`;

function regionSection(currentSlug = '', heading = '지역별 안내') {
  return `<section id="regions"><div class="wrap">
  <div class="sec-label">AREA</div>
  <h2 class="sec">${heading}</h2>
  <p class="sec-lead">${site.areaLabel} 출장 시공합니다. 아래 지역은 지역별 안내 페이지를 따로 두었습니다.</p>
  ${regionChips(currentSlug)}
</div></section>`;
}

function guideSection(exclude = '', heading = '알아두면 좋은 것들', limit = 0) {
  return `<section id="guides"><div class="wrap">
  <div class="sec-label">GUIDE</div>
  <h2 class="sec">${heading}</h2>
  <p class="sec-lead">맡기기 전에 궁금하실 만한 것들을 정리했습니다. 교체하지 않아도 되는 경우도 그대로 적었습니다.</p>
  ${guideCards(exclude, limit)}
</div></section>`;
}

const SPEC_STRIP = `<section><div class="wrap">
  <div class="sec-label">SIZE</div>
  <h2 class="sec">취급 규격</h2>
  <p class="sec-lead">75파이부터 900파이까지 ${site.sizes.length}종을 취급합니다. 기존 개구부 치수를 그대로 쓰는 경우가 대부분이지만, 배기가 부족했던 현장은 규격을 올려 잡기도 합니다.</p>
  ${specTable()}
  <p class="sec-lead" style="margin-top:18px">규격을 어떻게 고르는지는 <a href="/vent/guides/size/" style="color:var(--cta);font-weight:700">파이 규격 고르는 법</a>에 정리해 두었습니다.</p>
</div></section>`;

/* ── 1. 메인 ───────────────────────────────── */

const homeFaq = [
  { q: '옥상 환풍기가 안 도는데 교체해야 하나요?', a: ['회전이 멈춘 이유는 베어링 고착, 날개 변형, 이물질 끼임처럼 여러 가지입니다. 원인에 따라 손봐서 더 쓰는 경우도 있습니다.', '다만 상부가 부식으로 얇아져 있으면 고쳐도 오래 못 갑니다. 사진을 보내주시면 어느 쪽인지 먼저 말씀드립니다.'] },
  { q: '어떤 규격을 달아야 할지 모르겠습니다.', a: ['보통은 기존 개구부 치수에 맞춰 같은 규격으로 교체합니다. 75파이부터 900파이까지 취급하고 있습니다.', '배기가 부족했던 현장이나 신규 설치는 건물 용도와 층수, 개구부 여건을 보고 규격을 정합니다.'] },
  { q: '좌대도 같이 바꿔야 하나요?', a: ['환풍기보다 좌대가 먼저 삭는 현장이 많습니다. 좌대가 부식돼 있으면 새 제품을 올려도 고정이 헐거워집니다.', '현장에서 좌대 상태를 보고 함께 교체할지 판단해 미리 말씀드립니다.'] },
  { q: '신규 설치도 하시나요?', a: ['합니다. 환풍기가 없던 건물에 새로 다는 작업도 진행합니다.', '개구부를 새로 내야 하는지, 기존 배기구를 살릴 수 있는지에 따라 작업 범위가 달라져 실측이 필요합니다.'] },
  { q: '전기 공사가 필요한가요?', a: ['무동력 벤츄레이터는 바람과 실내외 온도차로 도는 방식이라 전기 배선이 필요 없습니다.', '전기요금이 들지 않고, 정전이나 스위치 조작과 무관하게 계속 배기됩니다.'] },
  { q: '어느 지역까지 오시나요?', a: ['서울·인천·경기 수도권 전 지역으로 출장 나갑니다. 지역별 안내 페이지에서 해당 지역 내용을 확인하실 수 있습니다.'] },
];

write('', layout({
  title: `옥상 환풍기 교체·벤츄레이터 설치 전문 | ${site.name}`,
  description: '옥상 무동력 벤츄레이터(옥상 환풍기) 교체·신규 설치 전문. 좌대 부식, 회전 정지, 소음까지 현장에서 함께 봅니다. 75~900파이 취급, 서울·인천·경기 수도권 전 지역 출장.',
  path: '/',
  jsonld: [ldLocalBusiness(), ldService(), ldFAQ(homeFaq)],
  body: `
<section class="hero"><div class="wrap">
  <div class="eyebrow">${site.areaLabel}</div>
  <h1>옥상 환풍기가 멈췄나요?<br>비가 오면 물이 새거나, 환기가 답답한가요?</h1>
  <p class="sub">녹슬고 멈춰버린 벤츄레이터, 제대로 진단하고 새 제품으로 깔끔하게 교체합니다.</p>
  <ul class="facts">
    <li>교체 · 신규 설치</li>
    <li>좌대 교체 병행</li>
    <li>75~900파이 ${site.sizes.length}종</li>
    <li>수도권 전 지역 출장</li>
  </ul>
  <div class="btns">
    <a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화</a>
    <a class="btn btn-ghost" href="sms:${site.telHref}">문자로 옥상 사진 보내기</a>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sec-label">SERVICE</div>
  <h2 class="sec">이런 작업을 합니다</h2>
  <div class="grid grid-4">
    <div class="card"><h4>노후 벤츄레이터 교체</h4><p>부식으로 상부가 찢어졌거나 회전이 멈춘 제품을 걷어내고 같은 규격으로 새로 앉힙니다.</p></div>
    <div class="card"><h4>좌대·후드 교체</h4><p>환풍기보다 먼저 삭는 것이 받침입니다. 좌대가 내려앉았으면 함께 교체해야 고정이 잡힙니다.</p></div>
    <div class="card"><h4>신규 설치</h4><p>환기구가 없던 건물에 새로 답니다. 개구부 위치와 크기를 실측해 정합니다.</p></div>
    <div class="card"><h4>소음·회전 불량 점검</h4><p>소리가 나거나 날개가 서 있는 경우, 교체가 필요한 상태인지 먼저 구분해 드립니다.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sec-label">WHY</div>
  <h2 class="sec">일하는 방식</h2>
  <div class="grid grid-4">
    <div class="card"><span class="no">01</span><h4>벤츄레이터만 합니다</h4><p>옥상 무동력 환풍기 교체와 설치가 주업입니다. 여러 공정을 곁다리로 하지 않습니다.</p></div>
    <div class="card"><span class="no">02</span><h4>사진으로 먼저 판단</h4><p>방문 전에 사진으로 상태를 보고, 교체가 필요 없어 보이면 그렇게 말씀드립니다.</p></div>
    <div class="card"><span class="no">03</span><h4>좌대까지 함께 확인</h4><p>상부만 바꿔서 될 현장인지, 받침과 방수 마감까지 봐야 하는 현장인지 구분합니다.</p></div>
    <div class="card"><span class="no">04</span><h4>수도권 직접 방문</h4><p>서울·인천·경기 전 지역을 직접 다닙니다. 옥상 접근 경로도 미리 확인합니다.</p></div>
  </div>
</div></section>

${caseSection('시공 사례', pickCases(4), `보정하지 않은 실제 현장 사진입니다. 왼쪽이 시공 전, 오른쪽이 시공 후입니다. <a href="/cases/" style="color:var(--cta);font-weight:700">사례 전체 보기 →</a>`)}

<section><div class="wrap">
  <div class="sec-label">CHECK</div>
  <h2 class="sec">이런 상태라면 한 번 보셔야 합니다</h2>
  <p class="sec-lead">옥상은 자주 올라가는 곳이 아니라 문제가 생겨도 한참 뒤에 발견됩니다. 아래 중 하나라도 해당되면 상태 확인을 권해드립니다.</p>
  <div class="grid grid-3">
    <div class="card"><h4>바람이 부는데 안 돈다</h4><p>베어링이 굳었거나 날개가 눌린 경우입니다. 안 도는 환풍기는 뚫린 구멍과 다를 바 없습니다.</p></div>
    <div class="card"><h4>끼익거리는 소리가 난다</h4><p>회전축 쪽에서 나는 소리가 대부분입니다. 방치하면 날개가 한쪽으로 쏠려 흔들립니다.</p></div>
    <div class="card"><h4>녹물이 흘러내린다</h4><p>상부에서 시작된 부식이 좌대와 옥상 바닥까지 번진 상태입니다.</p></div>
    <div class="card"><h4>상부가 찌그러졌다</h4><p>강풍이나 낙하물로 형태가 틀어지면 회전 균형이 깨지고 빗물이 들이칩니다.</p></div>
    <div class="card"><h4>비 온 뒤 아래층에 물이 샌다</h4><p>환풍기 자체보다 좌대와 방수층 접합부에서 새는 경우가 많습니다.</p></div>
    <div class="card"><h4>여름에 최상층이 유난히 덥다</h4><p>배기가 안 되면 열기가 그대로 쌓입니다. 규격이 부족한 경우도 있습니다.</p></div>
  </div>
</div></section>

${SPEC_STRIP}
${PROCESS}
${faqBlock(homeFaq)}
${guideSection('', '알아두면 좋은 것들', 6)}
${regionSection()}
${ctaBand('옥상 사진 한 장이면 됩니다', '지금 달려 있는 환풍기를 옆에서 찍은 사진 한 장과 건물 위치를 보내주세요. 교체가 필요한 상태인지 먼저 확인해 드립니다.')}`,
}));

/* ── 2. 서비스 허브 ────────────────────────── */

const hubFaq = [
  { q: '교체와 수리, 어느 쪽이 나은지 어떻게 정하나요?', a: ['회전만 뻑뻑한 초기 상태이고 몸통에 부식이 없다면 손봐서 더 쓰는 편이 낫습니다.', '반대로 상부가 얇아져 손으로 눌러도 들어가거나 좌대가 내려앉았으면 교체가 맞습니다. 수리비를 들이고도 곧 다시 올라가야 하기 때문입니다.'] },
  { q: '기존 개구부를 그대로 쓸 수 있나요?', a: ['대부분은 쓸 수 있습니다. 같은 규격으로 교체하면 개구부를 건드리지 않습니다.', '다만 개구부 테두리가 삭아 있거나 방수 마감이 깨져 있으면 그 부분을 정리한 뒤 앉혀야 합니다.'] },
  { q: '한 건물에 여러 대가 있으면 다 바꿔야 하나요?', a: ['상태가 제각각인 경우가 많아 전부 바꿀 필요는 없습니다. 대별로 상태를 보고 교체 대상과 그대로 둘 것을 나눠 말씀드립니다.', '다만 한 번 올라가는 김에 함께 하면 작업 효율이 올라가는 것은 맞습니다.'] },
  { q: '작업 시간은 얼마나 걸리나요?', a: ['1대 교체는 옥상 접근이 수월하면 오래 걸리지 않습니다. 좌대까지 함께 교체하면 시간이 더 듭니다.', '자재를 계단으로 올려야 하거나 대수가 많으면 하루가 걸리기도 해서, 실측할 때 미리 안내드립니다.'] },
  { q: '비 오는 날에도 작업하나요?', a: ['옥상 작업이라 비나 강풍이 있는 날은 진행하지 않습니다. 안전 문제도 있고 마감 품질도 떨어집니다.', '일정이 밀리면 미리 연락드리고 다시 잡습니다.'] },
  { q: '건물 관리사무소를 통해야 하나요?', a: ['아파트나 상가처럼 공용 옥상이면 관리 주체의 동의가 필요한 경우가 많습니다.', '옥상 출입 열쇠와 작업 승인만 확인해 주시면 나머지는 저희가 진행합니다.'] },
];

const hubTrail = [{ label: '홈', href: '/' }, { label: '옥상 환풍기 교체·설치' }];

write('vent', layout({
  title: `옥상 환풍기 교체·무동력 벤츄레이터 설치 | ${site.name}`,
  description: '옥상 무동력 벤츄레이터 교체와 신규 설치 전 과정을 정리했습니다. 교체가 필요한 상태, 좌대를 함께 봐야 하는 경우, 규격을 정하는 기준까지 현장 기준으로 안내합니다.',
  path: '/vent/',
  jsonld: [ldLocalBusiness(), ldService(), ldFAQ(hubFaq), ldBreadcrumb(hubTrail)],
  body: `
${breadcrumb(hubTrail)}
<section class="hero"><div class="wrap">
  <div class="eyebrow">교체 · 신규 설치</div>
  <h1>상부만 바꿀 현장인지,<br>좌대까지 손볼 현장인지</h1>
  <p class="sub">옥상 무동력 벤츄레이터는 겉보기에 멀쩡해도 상부 이음매부터 삭아 들어갑니다. 어디까지 손봐야 하는지 먼저 구분하고, 필요한 만큼만 작업합니다.</p>
  <div class="btns">
    <a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화</a>
    <a class="btn btn-ghost" href="/vent/spec/">취급 규격 보기</a>
  </div>
</div></section>

<section><div class="wrap"><div class="prose">
  <div class="sec-label">SERVICE</div>
  <h2 class="sec">작업 범위</h2>
  <p>옥상 환풍기 작업은 크게 네 가지로 나뉩니다. 어느 쪽이냐에 따라 자재도 작업 시간도 달라집니다.</p>
  <ul>
    <li><strong>노후 벤츄레이터 교체</strong> — 부식되거나 회전이 멈춘 제품을 걷어내고 같은 규격으로 새로 앉힙니다. 가장 많은 작업입니다.</li>
    <li><strong>좌대(받침)·후드 교체</strong> — 환풍기를 받치는 부분이 먼저 삭은 경우입니다. 여기가 헐거우면 새 제품을 올려도 흔들립니다.</li>
    <li><strong>신규 설치</strong> — 환기구가 없던 건물에 새로 답니다. 개구부를 어디에 낼지가 작업의 절반입니다.</li>
    <li><strong>회전 불량·소음 점검</strong> — 교체 전에 원인부터 봅니다. 이물질만 걷어내면 되는 경우도 있습니다.</li>
  </ul>
</div></div></section>

<section><div class="wrap">
  <div class="sec-label">CHECK</div>
  <h2 class="sec">교체가 필요한 경우, 아직 아닌 경우</h2>
  <p class="sec-lead">먼저 구분해 드립니다. 바꿀 필요가 없는 상태에서 굳이 교체를 권하지 않습니다.</p>
  <div class="tablewrap"><table>
    <thead><tr><th>상태</th><th>판단</th><th>이유</th></tr></thead>
    <tbody>
      <tr><td>상부가 부식으로 찢어졌다</td><td class="non">교체</td><td>얇아진 금속은 보강해도 다음 강풍에 다시 벌어집니다.</td></tr>
      <tr><td>좌대가 삭아 흔들린다</td><td class="non">좌대 포함 교체</td><td>받침이 헐거우면 새 제품도 고정이 잡히지 않습니다.</td></tr>
      <tr><td>날개가 눌리고 회전축이 휘었다</td><td class="non">교체</td><td>균형이 깨진 상태로 돌면 소음과 진동이 계속됩니다.</td></tr>
      <tr><td>회전이 뻑뻑하지만 몸통은 멀쩡하다</td><td class="yes">점검 후 판단</td><td>축 부위만 정리하면 더 쓰는 경우가 있습니다.</td></tr>
      <tr><td>표면에 얼룩만 있고 회전은 정상이다</td><td class="yes">그대로 사용</td><td>표면 오염은 성능과 관계없습니다.</td></tr>
      <tr><td>비 온 뒤 아래층에 물이 샌다</td><td class="non">접합부 확인 먼저</td><td>환풍기가 아니라 방수 마감이 원인인 경우가 많습니다.</td></tr>
    </tbody>
  </table></div>
  <p class="sec-lead">교체 시기를 가르는 신호는 <a href="/vent/guides/timing/" style="color:var(--cta);font-weight:700">교체 시기 안내</a>에서 더 자세히 다뤘습니다.</p>
</div></section>

${SPEC_STRIP}
${PROCESS}
${caseSection(`시공 사례 ${cases.length}건`, cases, '전부 실제 시공 사진입니다. 보정하지 않았고 왼쪽이 시공 전, 오른쪽이 시공 후입니다.')}
${faqBlock(hubFaq, '교체·설치 자주 묻는 질문')}
${guideSection('', '맡기기 전에 읽어보시면 좋은 글')}
${regionSection()}
${ctaBand('교체가 필요한 상태인지부터 봐 드립니다', '옥상에 올라가기 어려우시면 아래층 창문이나 옆 건물에서 찍은 사진도 괜찮습니다. 형태만 보여도 상당 부분 판단됩니다.')}`,
}));

/* ── 3. 취급 규격 ──────────────────────────── */

const specFaq = [
  { q: '파이는 무엇을 재는 치수인가요?', a: ['환풍기가 앉는 목 부분의 지름을 말합니다. 300파이면 그 지름이 약 300mm라는 뜻입니다.', '기존 제품을 교체할 때는 이 치수를 그대로 맞추는 것이 기본입니다.'] },
  { q: '지금 달린 규격을 어떻게 확인하나요?', a: ['제품 몸통이나 목 부분에 표기가 남아 있는 경우가 있습니다. 지워졌다면 개구부 지름을 줄자로 재면 됩니다.', '사진만 보내주셔도 주변 구조물과 비교해 대략 어느 규격인지 가늠할 수 있습니다.'] },
  { q: '더 큰 규격으로 바꾸면 환기가 잘 되나요?', a: ['배기량은 규격만이 아니라 급기가 되는지, 바람이 닿는 위치인지에 따라 달라집니다.', '규격만 키우고 공기가 들어올 곳이 없으면 기대만큼 빠지지 않습니다. 현장에서 함께 봅니다.'] },
  { q: '여러 대를 다는 것과 큰 것 한 대, 어느 쪽이 낫나요?', a: ['건물 폭이 넓거나 칸이 나뉜 구조라면 여러 대를 나눠 다는 편이 공기 흐름에 유리합니다.', '한 곳에 열기가 몰리는 구조라면 큰 규격 한 대가 나을 수 있어 현장을 보고 정합니다.'] },
];

const specTrail = [{ label: '홈', href: '/' }, { label: '옥상 환풍기 교체·설치', href: '/vent/' }, { label: '취급 규격' }];

write('vent/spec', layout({
  title: `벤츄레이터 취급 규격 75~900파이 | ${site.name}`,
  description: '루프벤트가 취급하는 무동력 벤츄레이터 규격 안내. 75·100·150·200·250·300·350·400·450·600·900파이를 다루며, 기존 개구부 치수와 건물 여건에 맞춰 규격을 정합니다.',
  path: '/vent/spec/',
  jsonld: [ldLocalBusiness(), ldService(), ldFAQ(specFaq), ldBreadcrumb(specTrail)],
  body: `
${breadcrumb(specTrail)}
<section class="hero"><div class="wrap">
  <div class="eyebrow">취급 규격</div>
  <h1>75파이부터 900파이까지</h1>
  <p class="sub">주택 화장실 배기용 소구경부터 공장·창고 지붕에 올라가는 대구경까지 ${site.sizes.length}종을 다룹니다. 교체는 기존 개구부 치수를 맞추는 것이 기본이고, 신규 설치는 건물 용도와 여건을 보고 정합니다.</p>
  <div class="btns"><a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 규격 문의</a></div>
</div></section>

<section><div class="wrap">
  <div class="sec-label">SIZE</div>
  <h2 class="sec">취급 규격 ${site.sizes.length}종</h2>
  <p class="sec-lead">아래 규격을 취급합니다. 목 부분 지름 기준이며, 교체 시에는 지금 달린 것과 같은 치수로 맞추는 경우가 대부분입니다.</p>
  ${specTable()}
</div></section>

<section><div class="wrap"><div class="prose">
  <div class="sec-label">GUIDE</div>
  <h2 class="sec">규격은 이렇게 정합니다</h2>
  <h3>교체할 때 — 기존 치수가 기준입니다</h3>
  <p>이미 달려 있던 자리에 새로 앉히는 작업이라면 개구부를 건드리지 않는 것이 가장 깔끔합니다. 같은 규격으로 교체하면 방수 마감을 새로 손댈 일도 줄어듭니다. 다만 그동안 배기가 부족하다고 느끼셨다면 그 이유가 규격 때문인지, 급기가 막혀서인지 현장에서 나눠 봅니다.</p>
  <h3>신규 설치할 때 — 용도와 개구부 여건을 봅니다</h3>
  <p>새로 다는 경우에는 건물 용도, 최상층 면적, 열기나 냄새가 어디서 올라오는지를 먼저 확인합니다. 개구부를 어디에 낼 수 있는지도 규격을 좌우합니다. 구조물이나 방수층 위치 때문에 원하는 자리에 못 내는 경우가 있어 <a href="/vent/guides/new-install/">신규 설치 안내</a>를 함께 보시면 이해가 빠릅니다.</p>
  <h3>규격만 키운다고 해결되지는 않습니다</h3>
  <p>공기는 빠져나간 만큼 들어와야 흐릅니다. 급기 경로가 없으면 큰 규격을 달아도 기대만큼 빠지지 않습니다. 반대로 작은 규격이 여러 대 나뉘어 있는 편이 나은 구조도 있습니다. 자세한 판단 기준은 <a href="/vent/guides/size/">파이 규격 고르는 법</a>에 정리했습니다.</p>
  <h3>재질도 함께 정합니다</h3>
  <p>같은 규격이어도 재질에 따라 버티는 기간이 다릅니다. 해풍이 닿는 지역이나 배기에 습기·유증기가 섞이는 건물은 재질을 올려 잡는 편이 결과적으로 낫습니다. <a href="/vent/guides/material/">재질과 부식</a>에서 차이를 정리해 두었습니다.</p>
</div></div></section>

${faqBlock(specFaq, '규격 관련 자주 묻는 질문')}
${guideSection('', '함께 보면 좋은 글', 3)}
${regionSection()}
${ctaBand('규격이 헷갈리시면 사진을 보내주세요', '줄자로 재기 어려우시면 사진만으로도 대략 판단이 됩니다. 주변 난간이나 배관과 비교해 규격을 가늠합니다.')}`,
}));

/* ── 4. 가이드 10편 ───────────────────────── */

for (const g of guides) {
  const url = `/vent/guides/${g.slug}/`;
  const trail = [{ label: '홈', href: '/' }, { label: '옥상 환풍기 교체·설치', href: '/vent/' }, { label: g.cardTitle }];
  write(`vent/guides/${g.slug}`, layout({
    title: g.title,
    description: g.description,
    path: url,
    jsonld: [ldLocalBusiness(), ldArticle({ title: g.title, description: g.description, url: site.domain + url }), ldFAQ(g.faq), ldBreadcrumb(trail)],
    body: `
${breadcrumb(trail)}
<section class="hero"><div class="wrap">
  <div class="eyebrow">가이드</div>
  <h1>${g.h1}</h1>
  <p class="sub">${g.lead}</p>
  <div class="btns"><a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화 상담</a></div>
</div></section>

<section><div class="wrap"><div class="prose">
  ${g.sections.map((s) => `<h3>${s.h2}</h3>${s.html}`).join('\n')}
</div></div></section>

${faqBlock(g.faq)}
${guideSection(g.slug, '함께 보면 좋은 글', 3)}
${regionSection('', '지역별 안내')}
${ctaBand('글로 다 설명되지 않는 부분이 있습니다', '옥상 사진 한 장이면 지금 상태가 어느 쪽인지 바로 판단해 알려드립니다.')}`,
  }));
}

/* ── 5. 지역 36개 ─────────────────────────── */

regions.forEach((r, ri) => {
  const full = r.city === '서울' || r.city === '인천' ? `${r.city} ${r.name}`.replace(/^(서울|인천) (서울|인천) /, '$1 ') : r.name;
  const trail = [{ label: '홈', href: '/' }, { label: '옥상 환풍기 교체·설치', href: '/vent/' }, { label: r.name }];

  const own = ownCases(r.slug);                       // 이 지역에서 실제로 한 작업
  const near = pickCasesForRegion(r.slug, 2, ri * 2); // 없으면 인근 지역 사례로 채움

  // 이 지역 사례가 있으면 사진을 본문보다 위에 올리고, 공유·검색 대표 이미지도 그 사진으로 씁니다.
  const topCases = own.length
    ? caseSection(`${full} 옥상 환풍기 교체 시공 사례`, own,
      `${full}에서 실제로 작업한 현장입니다. 보정하지 않은 사진이고 왼쪽이 시공 전, 오른쪽이 시공 후입니다.`,
      r.slug)
    : '';
  const bottomCases = own.length
    ? ''
    : caseSection('수도권 시공 사례', near,
      `아직 ${r.name} 현장 사진이 올라가 있지 않아 인근 지역 작업을 먼저 보여드립니다. 왼쪽이 시공 전, 오른쪽이 시공 후입니다. <a href="/cases/" style="color:var(--cta);font-weight:700">사례 전체 보기 →</a>`,
      r.slug);

  const ogImage = own.length ? own[0].after : '/img/og-default.jpg';

  write(`vent/regions/${r.slug}`, layout({
    title: r.title,
    description: r.description,
    path: `/vent/regions/${r.slug}/`,
    ogImage,
    jsonld: [
      ldLocalBusiness([full]),
      ldService(full, own.map((c) => site.domain + c.after)),
      ldFAQ(r.faq),
      ldBreadcrumb(trail),
    ],
    body: `
${breadcrumb(trail)}
<section class="hero"><div class="wrap">
  <div class="eyebrow">${full} 출장 시공</div>
  <h1>${r.h1}</h1>
  <p class="sub">${r.lead}</p>
  <ul class="facts">
    <li>교체 · 신규 설치</li>
    <li>좌대 교체 병행</li>
    <li>75~900파이</li>
  </ul>
  <div class="btns">
    <a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화</a>
    <a class="btn btn-ghost" href="sms:${site.telHref}">문자로 사진 보내기</a>
  </div>
</div></section>

${topCases}

<section><div class="wrap"><div class="prose">
  ${r.sections.map((s) => `<h3>${s.h2}</h3>${s.html}`).join('\n')}
</div></div></section>

${bottomCases}
${SPEC_STRIP}
${faqBlock(r.faq, `${r.name} 지역 자주 묻는 질문`)}
${guideSection('', `${r.name} 작업 전에 알아두면 좋은 것들`, 3)}
${regionSection(r.slug, '다른 지역 안내')}
${ctaBand(`${full} 어디든 출장 갑니다`, '지금 달려 있는 환풍기 사진과 건물 위치를 보내주시면 교체가 필요한 상태인지 먼저 확인해 드립니다.')}`,
  }));
});

/* ── 6. 시공 사례 목록 ─────────────────────── */

const caseTrail = [{ label: '홈', href: '/' }, { label: '시공 사례' }];

write('cases', layout({
  title: `옥상 환풍기 교체 시공 사례 | ${site.name}`,
  description: '루프벤트가 실제로 작업한 옥상 무동력 벤츄레이터 교체·설치 현장입니다. 시공 전과 시공 후 사진을 나란히 두고 어떤 상태였는지 그대로 적었습니다.',
  path: '/cases/',
  jsonld: [ldLocalBusiness(), ldBreadcrumb(caseTrail)],
  body: `
${breadcrumb(caseTrail)}
<section class="hero"><div class="wrap">
  <div class="eyebrow">시공 사례</div>
  <h1>작업한 현장을 그대로 올립니다</h1>
  <p class="sub">보정하지 않은 사진입니다. 왼쪽이 시공 전, 오른쪽이 시공 후이고 어떤 상태였고 무엇을 바꿨는지 그대로 적었습니다.</p>
  <div class="btns"><a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화</a></div>
</div></section>

${caseSection(`시공 사례 ${cases.length}건`, cases, '지금 옥상 상태와 비슷한 사례를 찾아보세요. 사진이 애매하면 전화 주셔도 됩니다.')}
${PROCESS}
${regionSection()}
${ctaBand('비슷한 상태이신가요', '사진을 보내주시면 같은 방식으로 작업이 되는 현장인지 알려드립니다.')}`,
}));

/* ── 7. 문의 ───────────────────────────────── */

const contactTrail = [{ label: '홈', href: '/' }, { label: '문의' }];

write('contact', layout({
  title: `문의·상담 | ${site.name} 옥상 환풍기 교체`,
  description: `옥상 무동력 벤츄레이터 교체·설치 문의는 ${site.tel}로 전화 또는 문자 주세요. 옥상 사진 한 장과 건물 위치만 있으면 상태 확인이 시작됩니다.`,
  path: '/contact/',
  jsonld: [ldLocalBusiness(), ldService(), ldBreadcrumb(contactTrail)],
  body: `
${breadcrumb(contactTrail)}
<section class="hero"><div class="wrap">
  <div class="eyebrow">문의</div>
  <h1>사진 한 장이면 시작됩니다</h1>
  <p class="sub">전화가 어려우시면 문자로 옥상 사진과 건물 위치만 보내주세요. 확인하는 대로 답을 드립니다.</p>
  <div class="btns">
    <a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화</a>
    <a class="btn btn-ghost" href="sms:${site.telHref}">문자 보내기</a>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sec-label">CONTACT</div>
  <h2 class="sec">이렇게 보내주시면 빠릅니다</h2>
  <div class="grid grid-3">
    <div class="card"><span class="no">01</span><h4>환풍기 사진</h4><p>옆에서 찍은 사진 한 장이면 상부 부식과 좌대 상태가 대부분 보입니다.</p></div>
    <div class="card"><span class="no">02</span><h4>건물 위치</h4><p>구 단위까지만 알려주셔도 됩니다. 방문 일정을 잡을 때 필요합니다.</p></div>
    <div class="card"><span class="no">03</span><h4>대수와 증상</h4><p>몇 대인지, 안 도는지 소리가 나는지 적어주시면 준비할 것이 정리됩니다.</p></div>
  </div>
</div></section>

<section><div class="wrap"><div class="prose">
  <h3>상담 안내</h3>
  <ul>
    <li><strong>대표번호</strong> — <a href="tel:${site.telHref}">${site.tel}</a> (전화·문자 모두 가능)</li>
    <li><strong>시공 범위</strong> — ${site.areaLabel}</li>
    <li><strong>작업 내용</strong> — 옥상 무동력 벤츄레이터 교체, 신규 설치, 좌대 교체</li>
    <li><strong>취급 규격</strong> — 75~900파이 ${site.sizes.length}종 (<a href="/vent/spec/">규격 안내</a>)</li>
  </ul>
  <p>작업 중이거나 옥상에 올라가 있을 때는 전화를 못 받을 수 있습니다. 부재중이면 확인하는 대로 다시 연락드립니다.</p>
</div></div></section>

${regionSection()}
${ctaBand('옥상까지 올라가기 어려우시면', '아래층 창문이나 옆 건물에서 찍은 사진도 괜찮습니다. 형태만 보여도 상당 부분 판단됩니다.')}`,
}));

/* ── 8. 정적 파일 ─────────────────────────── */

copyDir('public', OUT);

fs.writeFileSync(`${OUT}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#12405f"/><circle cx="32" cy="26" r="13" fill="none" stroke="#eaf2f8" stroke-width="4"/><path d="M32 13v26M19 26h26" stroke="#eaf2f8" stroke-width="3.5" stroke-linecap="round"/><path d="M18 46h28l-5 8H23z" fill="#e0532b"/></svg>`);

const now = new Date().toISOString().slice(0, 10);
const prio = (p) => (p === '/' ? '1.0'
  : p === '/vent/' ? '0.9'
  : p.includes('/regions/') ? '0.8'
  : p.includes('/guides/') ? '0.7' : '0.6');

fs.writeFileSync(`${OUT}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + pages.map((p) => `  <url><loc>${site.domain}${p}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>${prio(p)}</priority></url>`).join('\n')
  + `\n</urlset>\n`);

fs.writeFileSync(`${OUT}/robots.txt`,
  `User-agent: *\nAllow: /\n\nUser-agent: Yeti\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);

const feed = [
  ...guides.map((g) => ({ t: g.h1, d: g.description, u: `/vent/guides/${g.slug}/` })),
  ...regions.map((r) => ({ t: r.h1, d: r.description, u: `/vent/regions/${r.slug}/` })),
];
fs.writeFileSync(`${OUT}/rss.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n`
  + `<title>${site.name} — ${site.tagline}</title>\n<link>${site.domain}/</link>\n`
  + `<description>${site.tagline}. ${site.areaLabel}.</description>\n<language>ko</language>\n`
  + feed.map((f) => `<item><title>${f.t}</title><link>${site.domain}${f.u}</link><guid>${site.domain}${f.u}</guid><description>${f.d.replace(/[<>&]/g, '')}</description><pubDate>${new Date().toUTCString()}</pubDate></item>`).join('\n')
  + `\n</channel></rss>\n`);

// 네이버 서치어드바이저 수집요청용 URL 목록
fs.writeFileSync(`${OUT}/urls.txt`, pages.map((p) => site.domain + p).join('\n') + '\n');

fs.writeFileSync(`${OUT}/404.html`, layout({
  title: `페이지를 찾을 수 없습니다 | ${site.name}`,
  description: '요청하신 페이지가 없습니다.',
  path: '/404',
  body: `<section class="hero"><div class="wrap">
    <h1>페이지를 찾을 수 없습니다</h1>
    <p class="sub">주소가 바뀌었거나 없는 페이지입니다. 아래에서 찾아보세요.</p>
    <div class="btns"><a class="btn btn-primary" href="/">홈으로</a><a class="btn btn-ghost" href="/vent/">교체·설치 안내</a></div>
  </div></section>${regionSection()}`,
}));

console.log(`✓ ${pages.length}개 페이지 생성`);
console.log(`  메인 1 / 허브 1 / 규격 1 / 가이드 ${guides.length} / 지역 ${regions.length} / 사례 1 / 문의 1`);
