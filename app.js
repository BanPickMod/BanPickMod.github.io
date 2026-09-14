const state = {
  meta: null,
  units: [],
  modifiedUnits: [],
  systemDiffs: [],
  maps: [],
  patches: [],
  tutorials: [],
  race: 'all',
  query: '',
  guideIndex: 0
};

const AVAILABLE_ICONS = new Set([
  'firebat', 'goliath', 'warhound', 'wraith', 'science_vessel',
  'dragoon', 'energizer', 'corsair', 'scout', 'reaver', 'arbiter',
  'aberration', 'ravasaur', 'defiler', 'queen', 'tyrannozor', 'guardian'
]);

const MONOGRAMS = {
  firebat: 'FB', goliath: 'GL', warhound: 'WH', wraith: 'WR', science_vessel: 'SV',
  dragoon: 'DG', energizer: 'EN', corsair: 'CS', scout: 'SC', reaver: 'RV', arbiter: 'AR',
  aberration: 'AB', ravasaur: 'RS', defiler: 'DF', queen: 'QN', tyrannozor: 'TY', guardian: 'GD'
};

const RACE_LABELS = { terran: 'Terran', protoss: 'Protoss', zerg: 'Zerg' };

const elements = {
  menuToggle: document.querySelector('.menu-toggle'),
  primaryNav: document.querySelector('.primary-nav'),
  heroStats: document.getElementById('heroStats'),
  pillarsGrid: document.getElementById('pillarsGrid'),
  draftFlow: document.getElementById('draftFlow'),
  unitSearch: document.getElementById('unitSearch'),
  unitResultCount: document.getElementById('unitResultCount'),
  unitsGrid: document.getElementById('unitsGrid'),
  convenienceGrid: document.getElementById('convenienceGrid'),
  reworkGrid: document.getElementById('reworkGrid'),
  systemGrid: document.getElementById('systemGrid'),
  guideTabs: document.getElementById('guideTabs'),
  guidePanel: document.getElementById('guidePanel'),
  mapsGrid: document.getElementById('mapsGrid'),
  patchList: document.getElementById('patchList'),
  unitDialog: document.getElementById('unitDialog'),
  unitDialogRace: document.getElementById('unitDialogRace'),
  unitDialogTitle: document.getElementById('unitDialogTitle'),
  unitDialogBody: document.getElementById('unitDialogBody'),
  toast: document.getElementById('toast'),
  loadError: document.getElementById('loadError')
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupStaticInteractions();

  try {
    const [meta, units, modifiedUnits, systemDiffs, maps, patches, tutorials] = await Promise.all([
      fetchJson('data/site_meta.json'),
      fetchJson('data/units.json'),
      fetchJson('data/modified_units.json'),
      fetchJson('data/system_diffs.json'),
      fetchJson('data/maps.json'),
      fetchJson('data/patches.json'),
      fetchJson('data/tutorials.json')
    ]);

    Object.assign(state, { meta, units, modifiedUnits, systemDiffs, maps, patches, tutorials });
    renderAll();
    setupSectionObserver();
  } catch (error) {
    console.error('BPM website data load failed:', error);
    elements.unitsGrid.removeAttribute('aria-busy');
    elements.unitsGrid.innerHTML = '<div class="empty-state">데이터를 불러오지 못했습니다.</div>';
    elements.loadError.hidden = false;
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderAll() {
  renderMeta();
  renderUnits();
  renderConvenience();
  renderReworks();
  renderSystems();
  renderGuide();
  renderMaps();
  renderPatches();
}

function renderMeta() {
  const meta = state.meta;
  document.querySelectorAll('[data-version]').forEach((node) => { node.textContent = meta.releaseVersion; });
  document.querySelector('[data-release-date]').textContent = meta.releaseDate;
  document.querySelector('[data-release-label]').textContent = meta.releaseLabel;
  document.querySelector('[data-release-status]').textContent = meta.statusText;
  document.querySelector('[data-eyebrow]').textContent = meta.eyebrow;
  document.querySelector('[data-headline]').innerHTML = escapeHtml(meta.headline).replace('\n', '<br>');
  document.querySelector('[data-summary]').textContent = meta.summary;

  elements.heroStats.innerHTML = meta.stats.map((stat) => `
    <div class="stat"><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></div>
  `).join('');

  elements.pillarsGrid.innerHTML = meta.pillars.map((pillar) => `
    <article class="pillar-card">
      <span class="pillar-number">${escapeHtml(pillar.number)}</span>
      <span class="pillar-tag">${escapeHtml(pillar.tag)}</span>
      <h3>${escapeHtml(pillar.title)}</h3>
      <p>${escapeHtml(pillar.description)}</p>
    </article>
  `).join('');

  elements.draftFlow.innerHTML = meta.draftFlow.map((item) => `
    <li class="flow-card">
      <span class="flow-step">STEP ${escapeHtml(item.step)}</span>
      <span class="flow-phase">${escapeHtml(item.phase)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </li>
  `).join('');
}

function renderUnits() {
  const filtered = state.units.filter((unit) => {
    const raceMatches = state.race === 'all' || unit.race === state.race;
    const haystack = `${unit.name} ${unit.pairUnit} ${unit.building} ${unit.stats.damageType}`.toLowerCase();
    return raceMatches && (!state.query || haystack.includes(state.query));
  });

  elements.unitResultCount.textContent = `${filtered.length}개 유닛`;
  elements.unitsGrid.removeAttribute('aria-busy');

  if (!filtered.length) {
    elements.unitsGrid.innerHTML = '<div class="empty-state">조건과 일치하는 유닛이 없습니다. 검색어 또는 종족 필터를 바꿔 보세요.</div>';
    return;
  }

  elements.unitsGrid.innerHTML = filtered.map((unit) => `
    <article class="unit-card" data-race="${escapeHtml(unit.race)}">
      <div class="unit-card-top">
        <div class="unit-avatar">${unitAvatar(unit)}</div>
        <div>
          <span class="unit-race">${escapeHtml(RACE_LABELS[unit.race])}</span>
          <h3 title="${escapeHtml(unit.name)}">${escapeHtml(unit.name)}</h3>
        </div>
      </div>
      <p class="unit-pair"><span>PAIR</span> · ${escapeHtml(unit.pairUnit)}</p>
      <p class="unit-role">${escapeHtml(unit.stats.damageType || unit.building)}</p>
      <div class="unit-costs" aria-label="생산 비용">
        ${costChip('광물', unit.cost.minerals)}
        ${costChip('가스', unit.cost.gas)}
        ${costChip('인구', unit.cost.supply)}
        ${costChip('시간', `${unit.cost.time}s`)}
      </div>
      <button class="unit-detail-button" type="button" data-unit-id="${escapeHtml(unit.id)}">스펙과 페어 비교 보기</button>
    </article>
  `).join('');
}

function unitAvatar(unit) {
  if (AVAILABLE_ICONS.has(unit.id)) {
    return `<img src="${escapeHtml(unit.icon)}" alt="">`;
  }
  return `<span aria-hidden="true">${escapeHtml(MONOGRAMS[unit.id] || unit.name.slice(0, 2))}</span>`;
}

function costChip(label, value) {
  return `<div class="cost-chip"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function openUnitDialog(unitId) {
  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit) return;

  elements.unitDialogRace.textContent = `${RACE_LABELS[unit.race]} · ${unit.building}`;
  elements.unitDialogTitle.textContent = unit.name;
  elements.unitDialogBody.innerHTML = `
    <div class="dialog-summary">
      <div class="dialog-summary-card"><span>전술 페어</span><strong>${escapeHtml(unit.pairUnit)}</strong></div>
      <div class="dialog-summary-card"><span>생산 조건</span><strong>${escapeHtml(unit.techReq || unit.building)}</strong></div>
    </div>
    <section class="dialog-section">
      <h3>CORE SPEC</h3>
      <table class="stat-table"><tbody>
        <tr><td>내구도</td><td>체력 ${escapeHtml(unit.stats.hp)}${unit.stats.shields ? ` · 보호막 ${escapeHtml(unit.stats.shields)}` : ''} · 방어력 ${escapeHtml(unit.stats.armor)}</td></tr>
        <tr><td>기동·사거리</td><td>이동속도 ${escapeHtml(unit.stats.speed)} · 사거리 ${escapeHtml(unit.stats.range)}</td></tr>
        <tr><td>지상 공격</td><td>${escapeHtml(unit.stats.groundDmg)}</td></tr>
        <tr><td>공중 공격</td><td>${escapeHtml(unit.stats.airDmg)}</td></tr>
        <tr><td>생산 비용</td><td>광물 ${escapeHtml(unit.cost.minerals)} · 가스 ${escapeHtml(unit.cost.gas)} · 인구 ${escapeHtml(unit.cost.supply)} · ${escapeHtml(unit.cost.time)}초</td></tr>
      </tbody></table>
    </section>
    <section class="dialog-section">
      <h3>PAIR DIFFERENCE</h3>
      <table class="diff-table">
        <thead><tr><th>비교 항목</th><th>${escapeHtml(unit.pairUnit)}</th><th>${escapeHtml(unit.name)}</th></tr></thead>
        <tbody>${unit.diffFromPair.map((diff) => `<tr><td>${escapeHtml(diff.item)}</td><td>${escapeHtml(diff.pair)}</td><td>${escapeHtml(diff.unit)}</td></tr>`).join('')}</tbody>
      </table>
    </section>
    <section class="dialog-section">
      <h3>RESEARCH & UPGRADE</h3>
      ${unit.upgrades.length ? `<ul class="upgrade-list">${unit.upgrades.map((upgrade) => `
        <li class="upgrade-item"><strong>${escapeHtml(upgrade.name)}</strong><div class="upgrade-meta">${escapeHtml(upgrade.cost)} · ${escapeHtml(upgrade.building)}</div><p>${escapeHtml(upgrade.statDiff)}</p></li>
      `).join('')}</ul>` : '<p class="guide-summary">별도의 전용 연구가 없습니다.</p>'}
    </section>
  `;
  elements.unitDialog.showModal();
}

function renderConvenience() {
  elements.convenienceGrid.innerHTML = state.meta.convenienceFeatures.map((feature) => `
    <article class="convenience-card">
      <span class="feature-icon">${escapeHtml(feature.icon)}</span>
      <h3>${escapeHtml(feature.title)}</h3>
      <p>${escapeHtml(feature.description)}</p>
    </article>
  `).join('');
}

function renderReworks() {
  elements.reworkGrid.innerHTML = state.modifiedUnits.map((unit) => `
    <article class="rework-card">
      <span class="rework-tag">${escapeHtml(RACE_LABELS[unit.race])} · ${escapeHtml(unit.highlightFeature.badge)}</span>
      <h4>${escapeHtml(unit.name)}</h4>
      <p class="rework-feature">${escapeHtml(unit.highlightFeature.name)}</p>
      <p>${escapeHtml(unit.highlightFeature.purpose)}</p>
    </article>
  `).join('');
}

function renderSystems() {
  elements.systemGrid.innerHTML = state.systemDiffs.map((item) => `
    <article class="system-card">
      <div class="system-card-head"><h4>${escapeHtml(item.target)}</h4><span class="system-category">${escapeHtml(item.category)}</span></div>
      <p class="system-change">${escapeHtml(item.before)} <strong>→ ${escapeHtml(item.after)}</strong></p>
    </article>
  `).join('');
}

function renderGuide() {
  elements.guideTabs.innerHTML = state.tutorials.map((tutorial, index) => `
    <button id="guideTab-${index}" class="guide-tab" type="button" role="tab" aria-selected="${index === state.guideIndex}" aria-controls="guidePanel" tabindex="${index === state.guideIndex ? 0 : -1}" data-guide-index="${index}">
      <span>${escapeHtml(tutorial.stepNumber.replace('STEP ', ''))}</span><strong>${escapeHtml(tutorial.title)}</strong>
    </button>
  `).join('');

  const tutorial = state.tutorials[state.guideIndex];
  elements.guidePanel.setAttribute('aria-labelledby', `guideTab-${state.guideIndex}`);
  elements.guidePanel.innerHTML = `
    <span class="guide-badge">${escapeHtml(tutorial.badge)}</span>
    <h3>${escapeHtml(tutorial.title)}</h3>
    <p class="guide-summary">${escapeHtml(tutorial.summary)}</p>
    <ol class="guide-steps">${tutorial.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
  `;
}

function renderMaps() {
  elements.mapsGrid.innerHTML = state.maps.map((map, index) => `
    <article class="map-card">
      <span class="map-index">BATTLEGROUND ${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(map.name)}</h3>
      <span class="map-version">${escapeHtml(map.version)}</span>
      <p>${escapeHtml(map.terrain)}</p>
      <ul class="map-features">${map.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
      <div class="copy-row"><code class="copy-code">${escapeHtml(map.searchKeyword)}</code><button class="copy-button" type="button" data-copy="${escapeHtml(map.searchKeyword)}">복사</button></div>
    </article>
  `).join('');
}

function renderPatches() {
  elements.patchList.innerHTML = state.patches.map((patch, index) => {
    const open = index === 0;
    return `
      <article class="patch-item">
        <h3>
          <button class="patch-toggle" type="button" aria-expanded="${open}" aria-controls="patchBody-${index}" data-patch-index="${index}">
            <span class="patch-version">${escapeHtml(patch.version)}</span><span class="patch-title">${escapeHtml(patch.title)}</span><span class="patch-date">${escapeHtml(patch.date)}</span><span class="patch-arrow" aria-hidden="true">⌄</span>
          </button>
        </h3>
        <div id="patchBody-${index}" class="patch-body${open ? ' is-open' : ''}">
          <p class="patch-summary">${escapeHtml(patch.summary)}</p>
          <ul class="patch-changes">${patch.changes.map((change) => `<li><span class="change-category">${escapeHtml(change.category)}</span><span>${escapeHtml(change.text)}</span></li>`).join('')}</ul>
        </div>
      </article>`;
  }).join('');
}

function setupStaticInteractions() {
  elements.menuToggle.addEventListener('click', () => {
    const open = elements.menuToggle.getAttribute('aria-expanded') === 'true';
    elements.menuToggle.setAttribute('aria-expanded', String(!open));
    elements.menuToggle.querySelector('.sr-only').textContent = open ? '메뉴 열기' : '메뉴 닫기';
    elements.primaryNav.classList.toggle('is-open', !open);
  });

  elements.primaryNav.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    elements.menuToggle.setAttribute('aria-expanded', 'false');
    elements.menuToggle.querySelector('.sr-only').textContent = '메뉴 열기';
    elements.primaryNav.classList.remove('is-open');
  });

  document.querySelector('.filter-group').addEventListener('click', (event) => {
    const button = event.target.closest('[data-race]');
    if (!button) return;
    document.querySelectorAll('.filter-button[data-race]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    state.race = button.dataset.race;
    renderUnits();
  });

  elements.unitSearch.addEventListener('input', () => {
    state.query = elements.unitSearch.value.trim().toLowerCase();
    renderUnits();
  });

  document.addEventListener('click', (event) => {
    const unitButton = event.target.closest('[data-unit-id]');
    if (unitButton) openUnitDialog(unitButton.dataset.unitId);

    const guideButton = event.target.closest('[data-guide-index]');
    if (guideButton) {
      state.guideIndex = Number(guideButton.dataset.guideIndex);
      renderGuide();
      document.getElementById(`guideTab-${state.guideIndex}`).focus();
    }

    const patchButton = event.target.closest('[data-patch-index]');
    if (patchButton) {
      const body = document.getElementById(`patchBody-${patchButton.dataset.patchIndex}`);
      const open = patchButton.getAttribute('aria-expanded') === 'true';
      patchButton.setAttribute('aria-expanded', String(!open));
      body.classList.toggle('is-open', !open);
    }

    const copyButton = event.target.closest('[data-copy]');
    if (copyButton) copyText(copyButton.dataset.copy);

    if (event.target.closest('[data-close-dialog]')) elements.unitDialog.close();
  });

  elements.guideTabs.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    state.guideIndex = (state.guideIndex + direction + state.tutorials.length) % state.tutorials.length;
    renderGuide();
    document.getElementById(`guideTab-${state.guideIndex}`).focus();
  });

  elements.unitDialog.addEventListener('click', (event) => {
    if (event.target === elements.unitDialog) elements.unitDialog.close();
  });
}

function setupSectionObserver() {
  const links = [...elements.primaryNav.querySelectorAll('a[href^="#"]')];
  const linkById = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
  const sections = [...linkById.keys()].map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.classList.toggle('is-active', link === linkById.get(visible.target.id)));
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .2, .5] });

  sections.forEach((section) => observer.observe(section));
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    showToast(`“${text}” 검색어를 복사했습니다.`);
  } catch {
    showToast(`검색어: ${text}`);
  }
}

let toastTimer;
function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 2400);
}
