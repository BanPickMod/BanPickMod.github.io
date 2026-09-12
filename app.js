/**
 * BPM Official Web Showcase Application Controller
 * Handles Data Loading, Filtering, Interactive Video Modal, and Clipboard APIs
 */

// Application State
const state = {
  units: [],
  modifiedUnits: [],
  systemDiffs: [],
  maps: [],
  patches: [],
  tutorials: [],
  currentRaceFilter: 'all',
  currentModRaceFilter: 'all',
  searchQuery: '',
  activeTutorialStep: 0,
  currentModalUnit: null,
  simAnimationId: null
};

// Monogram Map for Unit Fallback Icons
const MONOGRAMS = {
  firebat: 'FB',
  goliath: 'GL',
  warhound: 'WH',
  wraith: 'WR',
  science_vessel: 'SV',
  dragoon: 'DG',
  energizer: 'EN',
  corsair: 'CS',
  scout: 'SC',
  reaver: 'RV',
  arbiter: 'AB',
  aberration: 'ABR',
  ravasaur: 'RS',
  defiler: 'DF',
  queen: 'QN',
  tyrannozor: 'TY',
  guardian: 'GD',
  raven: 'RVN',
  viper: 'VP',
  liberator: 'LIB',
  overlord: 'OV'
};

// DOM References
const elements = {
  unitsGrid: document.getElementById('unitsGrid'),
  raceTabs: document.querySelectorAll('.tab-btn'),
  searchInput: document.getElementById('searchInput'),
  modifiedUnitsGrid: document.getElementById('modifiedUnitsGrid'),
  modRaceTabs: document.querySelectorAll('.mod-tab-btn'),
  systemDiffsGrid: document.getElementById('systemDiffsGrid'),
  tutorialNav: document.getElementById('tutorialNav'),
  tutorialContent: document.getElementById('tutorialContent'),
  mapsGrid: document.getElementById('mapsGrid'),
  patchesTimeline: document.getElementById('patchesTimeline'),
  videoModal: document.getElementById('videoModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalVideo: document.getElementById('modalVideo'),
  simCanvas: document.getElementById('simCanvas'),
  simOverlayText: document.getElementById('simOverlayText'),
  modalStatsSummary: document.getElementById('modalStatsSummary'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  toast: document.getElementById('toast')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  setupEventListeners();
  renderUnits();
  renderModifiedUnits();
  renderSystemDiffs();
  renderTutorials();
  renderMaps();
  renderPatches();
});

// Data Fetcher
async function loadAllData() {
  try {
    const [unitsRes, modUnitsRes, sysRes, mapsRes, patchesRes, tutRes] = await Promise.all([
      fetch('data/units.json'),
      fetch('data/modified_units.json'),
      fetch('data/system_diffs.json'),
      fetch('data/maps.json'),
      fetch('data/patches.json'),
      fetch('data/tutorials.json')
    ]);

    state.units = await unitsRes.json();
    state.modifiedUnits = await modUnitsRes.json();
    state.systemDiffs = await sysRes.json();
    state.maps = await mapsRes.json();
    state.patches = await patchesRes.json();
    state.tutorials = await tutRes.json();
  } catch (err) {
    console.error('Failed to load JSON data:', err);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Race Tabs (Units Showcase)
  elements.raceTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.raceTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentRaceFilter = btn.dataset.race;
      renderUnits();
    });
  });

  // Race Tabs (Modified Units Section)
  elements.modRaceTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.modRaceTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentModRaceFilter = btn.dataset.modRace;
      renderModifiedUnits();
    });
  });

  // Search Input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderUnits();
  });

  // Modal Close
  elements.btnCloseModal.addEventListener('click', closeModal);
  elements.videoModal.addEventListener('click', (e) => {
    if (e.target === elements.videoModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.videoModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// 1. Render Units with Icons & High-Scanability Specs
function renderUnits() {
  const filtered = state.units.filter(unit => {
    const matchRace = (state.currentRaceFilter === 'all') || (unit.race === state.currentRaceFilter);
    const matchSearch = !state.searchQuery || 
      unit.name.toLowerCase().includes(state.searchQuery) ||
      unit.pairUnit.toLowerCase().includes(state.searchQuery) ||
      unit.building.toLowerCase().includes(state.searchQuery);
    return matchRace && matchSearch;
  });

  if (filtered.length === 0) {
    elements.unitsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-dim);">
        검색 조건과 일치하는 유닛이 없습니다.
      </div>
    `;
    return;
  }

  elements.unitsGrid.innerHTML = filtered.map(unit => {
    const monogram = MONOGRAMS[unit.id] || unit.name.substring(0, 2);

    return `
    <article class="unit-card" data-race="${unit.race}">
      <!-- Header with Unit Icon & Identity -->
      <div class="card-header-with-icon">
        <div class="unit-avatar-box">
          <img 
            src="${unit.icon}" 
            alt="${unit.name}" 
            class="unit-avatar-img"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
          />
          <span class="unit-avatar-monogram" style="display: none;">${monogram}</span>
        </div>

        <div class="unit-meta-group">
          <h3>${unit.name}</h3>
          <div class="unit-sub-badges">
            <span class="pair-badge">
              <span class="swap-icon">⇄</span> 페어: <strong>${unit.pairUnit}</strong>
            </span>
            <span class="building-pill">${unit.building}</span>
          </div>
        </div>
      </div>

      <!-- Resource Strip (With Graphical Icons) -->
      <div class="resource-strip">
        <div class="res-chip">
          <img src="assets/images/icons/resource-mineral.png" alt="광물" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">광물</span>
            <span class="res-val">${unit.cost.minerals}</span>
          </div>
        </div>
        <div class="res-chip">
          <img src="assets/images/icons/resource-gas.png" alt="가스" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">가스</span>
            <span class="res-val">${unit.cost.gas}</span>
          </div>
        </div>
        <div class="res-chip">
          <img src="assets/images/icons/resource-supply.png" alt="보급품" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">인구</span>
            <span class="res-val">${unit.cost.supply}</span>
          </div>
        </div>
        <div class="res-chip">
          <img src="assets/images/icons/resource-time.png" alt="생산시간" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">시간</span>
            <span class="res-val">${unit.cost.time}s</span>
          </div>
        </div>
      </div>

      <!-- High-Scanability Spec Matrix (Durability & Mobility) -->
      <div class="spec-matrix-grid">
        <div class="spec-matrix-cell">
          <div class="spec-cell-label">생존 내구도 (HP / Shields)</div>
          <div class="durability-pills">
            <span class="hp-val">${unit.stats.hp}</span>
            ${unit.stats.shields > 0 ? `<span class="shield-val">+${unit.stats.shields}</span>` : ''}
            <span class="armor-pill">방어력 ${unit.stats.armor}</span>
          </div>
        </div>
        <div class="spec-matrix-cell">
          <div class="spec-cell-label">기동 / 사거리</div>
          <div class="mobility-val">
            속도 ${unit.stats.speed} · 사거리 ${unit.stats.range > 0 ? unit.stats.range : '근접'}
          </div>
        </div>
      </div>

      <!-- Combat Attack Table Box -->
      <div class="combat-table-box">
        <div class="combat-row">
          <span class="combat-label">지상 화력:</span>
          <span class="combat-num">${unit.stats.groundDmg}</span>
        </div>
        <div class="combat-row">
          <span class="combat-label">대공 화력:</span>
          <span class="combat-num">${unit.stats.airDmg}</span>
        </div>
      </div>

      <!-- Active Unit Skills (e.g. Energizer Time Shield & Phasing Mode) -->
      ${unit.skills && unit.skills.length > 0 ? `
        <div class="unit-skills-box">
          <div class="skills-box-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            특수 기술 & 모드
          </div>
          ${unit.skills.map(sk => `
            <div class="skill-entry">
              <div class="skill-name-row">
                <span>${sk.name}</span>
                <div>
                  <span class="skill-cost-tag">${sk.cost}</span>
                  ${sk.range ? `<span class="skill-range-tag">· ${sk.range}</span>` : ''}
                </div>
              </div>
              <div class="skill-desc">${sk.effect}</div>
            </div>
          `).join('')}

          ${unit.id === 'energizer' ? `
            <div class="caution-callout">
              <strong>⚠️ 위상 모드 주의:</strong> 위상 모드 동력장 범위 내에서 차원 소환되는 아군 유닛은 <strong>보호막(Shield)이 0인 채로</strong> 소환됩니다.
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Pair Diff (Before ➔ After) -->
      <div class="diff-box">
        <div class="diff-header">${unit.pairUnit} 대비 핵심 변경점</div>
        ${unit.diffFromPair.map(diff => `
          <div class="diff-item">
            <span class="diff-prop">[${diff.item}]</span>
            <span style="color: var(--text-dim); text-decoration: line-through;">${diff.pair}</span>
            <span class="diff-arrow">➔</span>
            <span style="color: #fff; font-weight: 600;">${diff.unit}</span>
          </div>
        `).join('')}
      </div>

      <!-- Dedicated Upgrades with Research Building & Tech Requirements -->
      ${unit.upgrades && unit.upgrades.length > 0 ? `
        <div class="card-upgrades">
          ${unit.upgrades.map(up => `
            <div class="upgrade-card-item">
              <div class="up-header-row">
                <span class="up-title">⚡ ${up.name}</span>
                <span class="up-cost">${up.cost}</span>
              </div>
              <div class="up-req-row">
                <span class="up-pill-building">연구소: ${up.building}</span>
                <span class="up-pill-req">필요조건: ${up.requirement}</span>
              </div>
              <div class="up-effect-row">└ ${up.statDiff}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Action: Watch Video Clip -->
      <div class="card-actions">
        <button class="btn-clip" onclick="openVideoModal('${unit.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          ${unit.clip ? unit.clip.title : '기술 시연 클립 보기'}
        </button>
      </div>
    </article>
    `;
  }).join('');
}

// 2. Render Modified Existing Units & Added Abilities
function renderModifiedUnits() {
  if (!elements.modifiedUnitsGrid) return;

  const filtered = state.modifiedUnits.filter(unit => {
    return (state.currentModRaceFilter === 'all') || (unit.race === state.currentModRaceFilter);
  });

  if (filtered.length === 0) {
    elements.modifiedUnitsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-dim);">
        해당 조건의 개편 유닛이 없습니다.
      </div>
    `;
    return;
  }

  elements.modifiedUnitsGrid.innerHTML = filtered.map(unit => {
    const monogram = MONOGRAMS[unit.id] || unit.name.substring(0, 2);

    return `
    <article class="mod-unit-card" data-race="${unit.race}">
      <!-- Header with Identification & Monogram -->
      <div class="mod-card-header">
        <div class="unit-avatar-box">
          <span class="unit-avatar-monogram" style="display: block;">${monogram}</span>
        </div>

        <div class="mod-meta-group">
          <div class="mod-title-row">
            <h3>${unit.name}</h3>
            <span class="mod-category-badge">${unit.category}</span>
          </div>
          <div class="unit-sub-badges">
            <span class="pair-badge">
              <span class="swap-icon">⇄</span> 페어/편제: <strong>${unit.pairUnit}</strong>
            </span>
            <span class="building-pill">${unit.building}</span>
          </div>
        </div>
      </div>

      <!-- Resource Strip -->
      <div class="resource-strip">
        <div class="res-chip">
          <img src="assets/images/icons/resource-mineral.png" alt="광물" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">광물</span>
            <span class="res-val">${unit.cost.minerals}</span>
          </div>
        </div>
        <div class="res-chip">
          <img src="assets/images/icons/resource-gas.png" alt="가스" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">가스</span>
            <span class="res-val">${unit.cost.gas}</span>
          </div>
        </div>
        <div class="res-chip">
          <img src="assets/images/icons/resource-supply.png" alt="보급품" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">인구</span>
            <span class="res-val">${unit.cost.supply}</span>
          </div>
        </div>
        <div class="res-chip">
          <img src="assets/images/icons/resource-time.png" alt="생산시간" class="res-icon" />
          <div class="res-val-group">
            <span class="res-label">시간</span>
            <span class="res-val">${unit.cost.time}s</span>
          </div>
        </div>
      </div>

      <!-- Spec Matrix Grid -->
      <div class="spec-matrix-grid">
        <div class="spec-matrix-cell">
          <div class="spec-cell-label">체력 / 방어력</div>
          <div class="durability-pills">
            <span class="hp-val">${unit.stats.hp}</span>
            <span class="armor-pill">방어력 ${unit.stats.armor}</span>
          </div>
        </div>
        <div class="spec-matrix-cell">
          <div class="spec-cell-label">이동속도 / 사거리</div>
          <div class="mobility-val">
            속도 ${unit.stats.speed} · 사거리 ${unit.stats.range > 0 ? unit.stats.range : '근접'}
          </div>
        </div>
      </div>

      <!-- Combat Attack Table Box -->
      <div class="combat-table-box">
        <div class="combat-row">
          <span class="combat-label">지상 화력:</span>
          <span class="combat-num">${unit.stats.groundDmg}</span>
        </div>
        <div class="combat-row">
          <span class="combat-label">대공 화력:</span>
          <span class="combat-num">${unit.stats.airDmg}</span>
        </div>
      </div>

      <!-- Featured Highlight Ability Box -->
      <div class="mod-highlight-box">
        <div class="mod-highlight-top">
          <span class="mod-highlight-badge">${unit.highlightFeature.badge}</span>
          <span class="mod-hotkey-tag">단축키 ${unit.highlightFeature.hotkey}</span>
        </div>
        <h4 class="mod-highlight-title">${unit.highlightFeature.name}</h4>
        <div class="mod-highlight-params">
          <span class="param-chip">${unit.highlightFeature.cost}</span>
          <span class="param-chip">${unit.highlightFeature.range}</span>
          ${unit.highlightFeature.cooldown ? `<span class="param-chip">쿨다운 ${unit.highlightFeature.cooldown}</span>` : ''}
        </div>

        ${unit.highlightFeature.droneStats ? `
          <div class="drone-specs-box">
            <div class="sub-box-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              수리 비행정 (BPM_RepairDrone) 정밀 스펙
            </div>
            <div class="drone-metrics-grid">
              <div class="metric-item"><span class="m-label">생명력:</span> <span class="m-val">${unit.highlightFeature.droneStats.hp}</span></div>
              <div class="metric-item"><span class="m-label">에너지:</span> <span class="m-val">${unit.highlightFeature.droneStats.energy}</span></div>
              <div class="metric-item"><span class="m-label">지속시간:</span> <span class="m-val">${unit.highlightFeature.droneStats.duration}</span></div>
              <div class="metric-item"><span class="m-label">유닛분류:</span> <span class="m-val">${unit.highlightFeature.droneStats.type}</span></div>
            </div>
          </div>
        ` : ''}

        ${unit.highlightFeature.healMechanics ? `
          <div class="heal-mechanics-box">
            <div class="sub-box-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
              수리 메커니즘 (BPM_RepairDroneHeal)
            </div>
            <div class="heal-mechanics-content">
              <div class="heal-rate-row">
                <span class="heal-rate-badge">⚡ 수리 속도: <strong>${unit.highlightFeature.healMechanics.rate}</strong></span>
                <span class="heal-ratio-badge">효율: <strong>${unit.highlightFeature.healMechanics.ratio}</strong></span>
              </div>
              <div class="heal-condition-row">
                <span class="heal-cond-label">발동 조건:</span>
                <span class="heal-cond-text">${unit.highlightFeature.healMechanics.range} · ${unit.highlightFeature.healMechanics.target}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <p class="mod-purpose-text">${unit.highlightFeature.purpose}</p>
      </div>

      <!-- Full Ability Changes Matrix -->
      <div class="mod-abilities-container">
        <div class="mod-abilities-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          전체 능력 & 스펙 변경 내역
        </div>
        <div class="mod-abilities-list">
          ${unit.abilities.map(ab => `
            <div class="mod-ability-row status-${ab.status}">
              <div class="mod-ab-title-row">
                <div class="mod-ab-name-group">
                  <span class="mod-status-pill ${ab.status}">${ab.statusLabel}</span>
                  <span class="mod-ab-name">${ab.name}</span>
                </div>
                <div class="mod-ab-tags">
                  <span class="mod-ab-hotkey">${ab.hotkey}</span>
                  <span class="mod-ab-cost">${ab.cost}</span>
                </div>
              </div>
              <div class="mod-ab-desc">${ab.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </article>
    `;
  }).join('');
}

// 3. Render System Diffs
function renderSystemDiffs() {
  elements.systemDiffsGrid.innerHTML = state.systemDiffs.map(item => `
    <div class="system-card">
      <span class="system-badge">${item.category}</span>
      <h4 class="system-title">${item.target}</h4>
      <div class="comparison-box">
        <div class="comp-before">
          <strong>기존:</strong> ${item.before}
        </div>
        <div class="comp-after">
          <strong>BPM 변경:</strong> ${item.after}
        </div>
      </div>
      <p class="system-purpose">${item.purpose}</p>
    </div>
  `).join('');
}

// 3. Render Tutorials (With Observer Mode Highlight)
function renderTutorials() {
  elements.tutorialNav.innerHTML = state.tutorials.map((tut, idx) => `
    <button class="t-step-btn ${idx === state.activeTutorialStep ? 'active' : ''}" onclick="selectTutorialStep(${idx})">
      <div class="t-step-num">${tut.stepNumber}</div>
      <div class="t-step-title">${tut.title}</div>
    </button>
  `).join('');

  const cur = state.tutorials[state.activeTutorialStep];
  if (!cur) return;

  const isObserverStep = cur.id === 'step2';

  elements.tutorialContent.innerHTML = `
    <div class="t-content-header">
      <span class="t-content-badge">${cur.badge}</span>
      <h3 class="t-content-title">${cur.title}</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">${cur.summary}</p>
    </div>

    ${isObserverStep ? `
      <div class="observer-callout-banner">
        <h4>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          옵저버 모드 공식 연결 공식 절차
        </h4>
        <p style="font-size: 0.88rem; line-height: 1.5; color: #e0f0ff;">
          일반 [방 만들기] 대신 <strong>[모드로 만들기]</strong>를 클릭하고 확장 모드 검색창에서 <strong>BPM_Observer</strong>를 추가해야만 관전자 화면에 전용 브로드캐스트 밴픽 UI와 오버레이 HUD가 구동됩니다.
        </p>
      </div>
    ` : ''}

    <ul class="t-steps-list">
      ${cur.steps.map(step => `<li>${step}</li>`).join('')}
    </ul>

    ${cur.youtubeId ? `
      <div class="video-embed-wrapper">
        <iframe 
          src="https://www.youtube.com/embed/${cur.youtubeId}?rel=0" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    ` : `
      <div style="background: rgba(0,0,0,0.4); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        ※ 인게임 가이드 영상 등록 준비 중입니다. 위 공식 단계 가이드를 참조해 주세요.
      </div>
    `}
  `;
}

function selectTutorialStep(idx) {
  state.activeTutorialStep = idx;
  renderTutorials();
}

// 4. Render Maps (Search Keyword format: BPM_MapName)
function renderMaps() {
  elements.mapsGrid.innerHTML = state.maps.map(map => `
    <div class="map-card">
      <div class="map-header">
        <h4 class="map-title">${map.name}</h4>
        <span class="map-version">${map.version}</span>
      </div>

      <p class="map-terrain">${map.terrain}</p>

      <ul class="map-features-list">
        ${map.features.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <div class="map-copy-box">
        <input type="text" class="copy-input" value="${map.searchKeyword}" readonly />
        <button class="btn-copy" onclick="copyMapKeyword('${map.searchKeyword}')">검색어 복사</button>
      </div>
    </div>
  `).join('');
}

function copyMapKeyword(keyword) {
  navigator.clipboard.writeText(keyword).then(() => {
    showToast(`배틀넷 검색어 "${keyword}" 복사 완료!`);
  }).catch(() => {
    showToast(`검색어: ${keyword}`);
  });
}

// 5. Render Patches
function renderPatches() {
  elements.patchesTimeline.innerHTML = state.patches.map((patch, idx) => `
    <div class="patch-item ${idx === 0 ? 'open' : ''}" id="patch-${idx}">
      <div class="patch-header" onclick="togglePatch(${idx})">
        <div class="patch-title-group">
          <span class="patch-version">${patch.version}</span>
          <span class="patch-name">${patch.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span class="patch-date">${patch.date}</span>
          <span class="patch-chevron">▼</span>
        </div>
      </div>
      <div class="patch-body">
        <p class="patch-summary">${patch.summary}</p>
        <ul class="patch-changes-list">
          ${patch.changes.map(ch => `
            <li class="patch-change-row">
              <span class="cat-pill" data-cat="${ch.category}">${ch.category}</span>
              <span style="color: #fff;">${ch.text}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function togglePatch(idx) {
  const item = document.getElementById(`patch-${idx}`);
  if (item) {
    item.classList.toggle('open');
  }
}

// 6. Video Modal & Interactive Tactical Visualizer
function openVideoModal(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  state.currentModalUnit = unit;
  elements.modalTitle.textContent = `${unit.name} — 전투 및 스킬 시연`;
  elements.modalStatsSummary.textContent = `비용: ${unit.cost.minerals}/${unit.cost.gas} | 인구수: ${unit.cost.supply} | 생산: ${unit.building} (${unit.cost.time}초)`;

  elements.modalVideo.src = unit.clip.src || '';
  elements.modalVideo.style.display = 'none';
  elements.simCanvas.style.display = 'block';

  elements.modalVideo.onloadeddata = () => {
    elements.modalVideo.style.display = 'block';
    elements.simCanvas.style.display = 'none';
    elements.modalVideo.play();
  };

  elements.modalVideo.onerror = () => {
    elements.modalVideo.style.display = 'none';
    elements.simCanvas.style.display = 'block';
    startTacticalSimulation(unit);
  };

  startTacticalSimulation(unit);
  elements.videoModal.classList.add('active');
}

function closeModal() {
  elements.videoModal.classList.remove('active');
  elements.modalVideo.pause();
  elements.modalVideo.src = '';
  if (state.simAnimationId) {
    cancelAnimationFrame(state.simAnimationId);
    state.simAnimationId = null;
  }
}

// Canvas Tactical Visualizer for SC2 unit skills
function startTacticalSimulation(unit) {
  if (state.simAnimationId) {
    cancelAnimationFrame(state.simAnimationId);
  }

  const canvas = elements.simCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = 752;
  canvas.height = 423;

  let frame = 0;
  elements.simOverlayText.textContent = `[전술 시뮬레이션 모드] ${unit.name}: 3~6초 루프 전투 분석`;

  function animate() {
    frame++;
    ctx.fillStyle = '#060a10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(0, 168, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (unit.id === 'energizer') {
      // Energizer: Time Shield (시간 방패) 3.5 Radius Pulsing Aura
      ctx.save();
      ctx.translate(centerX, centerY);

      const pulseRadius = 110 + Math.sin(frame * 0.06) * 10;
      ctx.fillStyle = 'rgba(241, 196, 15, 0.12)';
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Range indicator text
      ctx.fillStyle = '#f1c40f';
      ctx.font = '12px Consolas';
      ctx.fillText('RADIUS 3.5 TIME SHIELD', -65, pulseRadius + 18);

      // Speed particles
      for (let i = 0; i < 12; i++) {
        const ang = (frame * 0.03) + (i * Math.PI / 6);
        const px = Math.cos(ang) * (pulseRadius * 0.7);
        const py = Math.sin(ang) * (pulseRadius * 0.7);
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      ctx.fillStyle = '#f1c40f';
      ctx.font = '14px Consolas';
      ctx.fillText('TIME SHIELD (시간 방패) — 아군 공/이속 +5% 가속 & 적군 -5% 둔화', 120, 360);
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '12px Consolas';
      ctx.fillText('※ 위상 모드 차원 소환 시 보호막 0 주의', 240, 385);

    } else if (unit.id === 'corsair') {
      // Corsair Disruption Web
      ctx.save();
      ctx.translate(centerX, centerY);
      const radius = 90 + Math.sin(frame * 0.05) * 6;
      
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 255, 200, 0.15)';
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const angle = (frame * 0.02) + (i * Math.PI / 4);
        const px = Math.cos(angle) * (radius * 0.7);
        const py = Math.sin(angle) * (radius * 0.7);
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = '#00ffcc';
      ctx.font = '14px Consolas';
      ctx.fillText('DISRUPTION WEB ACTIVE — 지상 유닛 및 포탑 사격 완전 무력화', 120, 360);

    } else if (unit.id === 'defiler') {
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const swarmSize = 100 + Math.sin(frame * 0.04) * 8;
      ctx.fillStyle = 'rgba(235, 100, 40, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, swarmSize, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 20; i++) {
        const t = (frame * 0.03 + i) % Math.PI;
        const dist = Math.sin(t) * swarmSize;
        const px = Math.cos(i * 1.5) * dist;
        const py = Math.sin(i * 1.5) * dist;
        ctx.fillStyle = (i % 2 === 0) ? '#ff5500' : '#c729f2';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = '#ff7733';
      ctx.font = '14px Consolas';
      ctx.fillText('DARK SWARM / PLAGUE — 원거리 투사체 완전 방어 및 지속 체력 삭감', 120, 360);

    } else if (unit.id === 'goliath') {
      ctx.fillStyle = '#00a8ff';
      ctx.fillRect(centerX - 20, centerY + 60, 40, 40);

      const progress = (frame % 60) / 60;
      const my = (centerY + 60) - (progress * 180);
      
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(centerX - 15, my, 4, 0, Math.PI * 2);
      ctx.arc(centerX + 15, my, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 60, 60, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 30, centerY - 140, 60, 30);

      ctx.fillStyle = '#00a8ff';
      ctx.font = '14px Consolas';
      ctx.fillText('CHARON BOOSTERS (사거리 9) — 2연장 즉시 반응 대공 요격', 130, 360);

    } else {
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const sweepAngle = (frame * 0.04) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 168, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweepAngle) * 110, Math.sin(sweepAngle) * 110);
      ctx.stroke();

      ctx.fillStyle = (unit.race === 'zerg') ? '#c729f2' : (unit.race === 'protoss') ? '#f1c40f' : '#00a8ff';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = '#889bb4';
      ctx.font = '14px Consolas';
      ctx.fillText(`TARGET LOCKED: ${unit.name} (${unit.pairUnit} 페어)`, 180, 360);
    }

    state.simAnimationId = requestAnimationFrame(animate);
  }

  animate();
}

// Toast Helper
function showToast(msg) {
  elements.toast.textContent = msg;
  elements.toast.classList.add('show');
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}
