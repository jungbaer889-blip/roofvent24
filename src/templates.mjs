import { site, nav } from '../site.config.mjs';
import { regions, regionGroups } from './data/regions.mjs';
import { guides } from './data/guides.mjs';

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const strip = (s = '') => String(s).replace(/<[^>]+>/g, '');

/* ── 공통 조각 ───────────────────────────────── */

export function header() {
  return `<header class="hdr"><div class="wrap hdr-in">
  <a class="logo" href="/"><span class="logo-mark" aria-hidden="true"></span><span class="logo-txt">${site.name}<small>${site.tagline}</small></span></a>
  <nav class="gnb" aria-label="주요 메뉴">${nav.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')}</nav>
  <a class="hdr-tel" href="tel:${site.telHref}">${site.tel}</a>
</div></header>`;
}

export function actionbar() {
  const second = site.kakao
    ? `<a class="ab-sub" href="${site.kakao}" target="_blank" rel="noopener">카톡으로 사진 보내기</a>`
    : `<a class="ab-sub" href="sms:${site.telHref}">문자로 옥상 사진 보내기</a>`;
  return `<div class="actionbar">
  <a class="ab-tel" href="tel:${site.telHref}">전화 상담</a>${second}
</div>`;
}

export function ctaBand(title, body) {
  const second = site.kakao
    ? `<a class="btn btn-ghost" href="${site.kakao}" target="_blank" rel="noopener">카톡으로 사진 보내기</a>`
    : `<a class="btn btn-ghost" href="sms:${site.telHref}">문자로 사진 보내기</a>`;
  return `<section class="cta-band"><div class="wrap">
  <h2>${title}</h2>
  <p>${body}</p>
  <div class="btns"><a class="btn btn-primary" href="tel:${site.telHref}">${site.tel} 전화</a>${second}</div>
</div></section>`;
}

export function faqBlock(items, heading = '자주 묻는 질문') {
  return `<section id="faq"><div class="wrap">
  <div class="sec-label">FAQ</div>
  <h2 class="sec">${heading}</h2>
  <div class="faq">${items.map((f) => `<details>
    <summary>${f.q}</summary>
    <div class="a">${f.a.map((p) => `<p>${p}</p>`).join('')}</div>
  </details>`).join('')}</div>
</div></section>`;
}

/* 지역 칩 — 도시별로 묶어서 보여줍니다 */
export function regionChips(currentSlug = '') {
  return regionGroups.map(({ city, list }) => {
    const items = list.filter((r) => r.slug !== currentSlug);
    if (!items.length) return '';
    return `<div class="chip-group">
      <h3 class="chip-city">${city}<span>${items.length}곳</span></h3>
      <ul class="chips">${items.map((r) =>
        `<li><a href="/vent/regions/${r.slug}/">${r.name} 옥상 환풍기</a></li>`).join('')}</ul>
    </div>`;
  }).join('');
}

export function guideCards(exclude = '', limit = 0) {
  let list = guides.filter((g) => g.slug !== exclude);
  if (limit) list = list.slice(0, limit);
  return `<div class="grid grid-3">${list.map((g) => `<a class="card card-link" href="/vent/guides/${g.slug}/">
    <h4>${g.cardTitle}</h4><p>${g.cardDesc}</p><span class="more">자세히 보기 →</span>
  </a>`).join('')}</div>`;
}

export function specTable() {
  return `<div class="sizes">${site.sizes.map((s) =>
    `<span class="size">${s}<i>파이</i></span>`).join('')}</div>`;
}

export function breadcrumb(trail) {
  return `<div class="wrap"><nav class="bc" aria-label="현재 위치">${
    trail.map((t, i) => (i ? '<span aria-hidden="true">›</span>' : '')
      + (t.href ? `<a href="${t.href}">${t.label}</a>` : `<b>${t.label}</b>`)).join('')
  }</nav></div>`;
}

export function footer() {
  const biz = [
    site.company ? `<b>${site.company}</b>` : '',
    site.ceo ? `대표 ${site.ceo}` : '',
    site.bizNo ? `사업자등록번호 ${site.bizNo}` : '',
  ].filter(Boolean).join(' · ');

  return `<footer class="ft"><div class="wrap">
  <div class="ft-cols">
    <div>
      <h4>${site.nameSpaced}</h4>
      <p>${site.tagline}<br>${site.areaLabel}</p>
      <p class="ft-tel"><a href="tel:${site.telHref}">${site.tel}</a></p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="/vent/">옥상 환풍기 교체·신규 설치</a></li>
        <li><a href="/vent/spec/">취급 규격 (75~900파이)</a></li>
        <li><a href="/cases/">시공 사례</a></li>
        <li><a href="/contact/">문의</a></li>
      </ul>
    </div>
    <div>
      <h4>알아두면 좋은 글</h4>
      <ul>${guides.slice(0, 5).map((g) => `<li><a href="/vent/guides/${g.slug}/">${g.cardTitle}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h4>지역 안내</h4>
      <ul>${regionGroups.map(({ city, list }) =>
        `<li>${city} <b>${list.length}곳</b></li>`).join('')}
        <li><a href="/vent/#regions">전체 지역 보기</a></li>
      </ul>
    </div>
  </div>
  <div class="ft-biz">
    ${biz ? biz + '<br>' : ''}
    ${site.promises.join(' · ')}<br>
    © ${new Date().getFullYear()} ${site.name}. All rights reserved.
  </div>
</div></footer>`;
}

/* ── 레이아웃 ────────────────────────────────── */

export function layout({ title, description, path, body, jsonld = [], ogImage = '/img/og-default.jpg' }) {
  const url = site.domain + path;
  const ld = jsonld.length
    ? jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')
    : '';
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(strip(description))}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(strip(description))}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.domain}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
${site.naverVerification ? `<meta name="naver-site-verification" content="${site.naverVerification}">` : '<!-- TODO: 네이버 서치어드바이저 소유확인 메타태그 -->'}
${site.googleVerification ? `<meta name="google-site-verification" content="${site.googleVerification}">` : '<!-- TODO: 구글 서치콘솔 소유확인 메타태그 -->'}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/styles.css">
${ld}
</head>
<body>
${header()}
<main>
${body}
</main>
${footer()}
${actionbar()}
</body>
</html>`;
}

/* ── JSON-LD ─────────────────────────────────── */

export function ldLocalBusiness(areaNames = null) {
  const areas = areaNames || regions.map((r) => `${r.city} ${r.name}`.replace('경기 부천 부천 ', '경기 부천 '));
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${site.domain}/#business`,
    name: site.company || site.name,
    alternateName: site.name,
    description: `${site.tagline}. ${site.areaLabel}.`,
    url: site.domain,
    telephone: site.tel,
    image: `${site.domain}/img/og-default.jpg`,
    areaServed: areas.map((n) => ({ '@type': 'AdministrativeArea', name: n })),
    knowsAbout: [
      '옥상 환풍기 교체', '무동력 벤츄레이터 설치', '벤츄레이터 좌대 교체',
      '옥상 환기', '공장 지붕 환기', '벤츄레이터 소음 수리',
    ],
  };
}

export function ldService(regionName = '', images = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: '옥상 무동력 벤츄레이터 교체·신규 설치',
    provider: { '@id': `${site.domain}/#business` },
    ...(regionName ? { areaServed: { '@type': 'AdministrativeArea', name: regionName } } : {}),
    ...(images.length ? { image: images } : {}),
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: { '@type': 'ContactPoint', telephone: site.tel, contactType: '상담' },
    },
  };
}

export function ldFAQ(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') },
    })),
  };
}

export function ldArticle({ title, description, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: strip(description),
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@id': `${site.domain}/#business` },
    mainEntityOfPage: url,
  };
}

export function ldBreadcrumb(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.label,
      ...(t.href ? { item: site.domain + t.href } : {}),
    })),
  };
}
