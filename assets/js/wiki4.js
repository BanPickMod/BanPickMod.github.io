/* Wiki 4: full balance roster. All base-game units (from the balance XML export) + the 17 BPM extension units,
   a dedicated "BPM added units" view that sets each extension unit against the base unit it replaces. */
(function () {
  const { S, B, t, esc, ico, raceName, raceGlyph, tr, delta, uname } = window.H;
  const st = { view: "all", race: "all", ver: "v1.4.3", q: "", mode: "table", changed: false, grp: { cost: true, body: true, combat: true, abil: true }, open: null };

  const ATTR = { Light: ["경장갑", "Light"], Armored: ["중장갑", "Armored"], Biological: ["생체", "Biological"], Mechanical: ["기계", "Mechanical"], Massive: ["거대", "Massive"], Psionic: ["사이오닉", "Psionic"], Structure: ["건물", "Structure"], Summoned: ["소환", "Summoned"], Hero: ["영웅", "Hero"] };
  const attrName = (a) => (ATTR[a] ? t(ATTR[a][0], ATTR[a][1]) : a);
  const TGT = { ground: ["지상", "Ground"], air: ["공중", "Air"], any: ["지상/공중", "Ground/Air"] };
  const GRP = { worker: ["일꾼", "Worker"], ground: ["지상", "Ground"], air: ["공중", "Air"], mode: ["모드 전환형", "Mode form"], ext: ["BPM 추가", "BPM added"] };
  const grpName = (g) => t(GRP[g][0], GRP[g][1]);
  const ABIL = { "Hallucination": ["환상", "Hallucination"] };
const BLD = { "Command Center": "사령부", Barracks: "병영", "Tech Lab": "기술실", "Barracks Tech Lab": "병영 기술실", "Ghost Academy": "유령 사관학교", Factory: "군수공장", Armory: "무기고", "Factory Tech Lab": "군수공장 기술실", Starport: "우주공항", "Fusion Core": "융합로", Nexus: "연결체", Gateway: "관문", "Cybernetics Core": "인공제어소", "Templar Archive": "기사단 문서보관소", "Dark Shrine": "암흑 성소", "High Templar": "고위 기사", "Robotics Facility": "로봇공학시설", "Robotics Bay": "로봇공학지원소", Stargate: "우주관문", "Fleet Beacon": "함대 신호소", Mothership: "모선", Larva: "애벌레", "Spawning Pool": "산란못", Zergling: "저글링", "Baneling Nest": "맹독충 둥지", "Roach Warren": "바퀴 소굴", Roach: "바퀴", "Hydralisk Den": "히드라리스크 굴", Hydralisk: "히드라리스크", "Lurker Den MP": "가시지옥 굴", "Infestation Pit": "감염 구덩이", "Ultralisk Cavern": "울트라리스크 동굴", Hatchery: "부화장", Overlord: "대군주", Lair: "군락", Spire: "둥지탑", Corruptor: "타락귀", "Greater Spire": "거대 둥지탑", Hive: "산란장", Ground: "지상", Fly: "비행", CliffJumper: "절벽 이동", Colossus: "거신" };
  const loc = (s) => (window.H.L.lang === "ko" && BLD[s] ? BLD[s] : s);
  const fmt = (v) => (v === null || v === undefined || v === "" ? "-" : v);

  /* ---------- row builders ---------- */
  // every unit carries v["v1.4.3"] and v["v1.4.1"]: base-game export (or curated sheet) overlaid with that build's mod XML
  const sig = (ws) => (ws || []).map((x) => [x.dmg, x.bonus.map((y) => y.type + y.dmg).join(), x.cd, x.range].join("|")).join(";");
  const rowOf = (u, kind) => {
    const cur = u.v[st.ver], prev = st.ver === "v1.4.3" ? u.v["v1.4.1"] : null, ch = {};
    const known = (k) => prev && prev.prov[k] && prev.prov[k] !== "curated" && cur.prov[k] && cur.prov[k] !== "curated";
    ["hp", "shields", "armor", "shieldArmor", "speed", "sight", "radius", "cargo"].forEach((k) => { if (known(k) && prev[k] !== null && cur[k] !== null && prev[k] !== cur[k]) ch[k] = prev[k]; });
    // a cost field counts as "known before" only when the previous build set it (BPM units) or the base export has it (base units)
    ["minerals", "gas", "supply", "time"].forEach((k) => { const pv = prev && prev.cost[k], cv = cur.cost[k], pp = prev && prev.prov["cost." + k]; if (prev && pv !== null && pv !== undefined && cv !== null && cv !== undefined && pv !== cv && (kind === "base" || pp === "mod")) ch[k] = pv; });
    if (known("attrs") && prev.attrs && cur.attrs && prev.attrs.slice().sort().join() !== cur.attrs.slice().sort().join()) ch.attrs = prev.attrs.map(attrName).join(" · ");
    const wsPrev = prev && prev.weapons && prev.prov.weapons && prev.prov.weapons !== "curated" ? prev.weapons : null;
    const rng = cur.weapons && cur.weapons.length ? Math.max(0, ...cur.weapons.map((x) => x.range || 0)) : cur.text ? cur.text.range : null;
    if (wsPrev && cur.weapons && sig(wsPrev) !== sig(cur.weapons) && wsPrev.every((x) => x.dmg !== null)) ch.weapons = wsPrev;
    if (st.ver === "v1.4.3") {
      const KEY = { "생명력": "hp", "인구수": "supply", "이동 속도": "speed" };
      const p143 = B.patches.find((p) => p.version === "v1.4.3");
      ((p143 && p143.diffs) || []).filter((d) => (d.unitId ? d.unitId === u.id : d.unit === u.en) && KEY[d.ko]).forEach((d) => {
        const k = KEY[d.ko], now = k === "supply" ? cur.cost.supply : cur[k], before = parseFloat(d.before), after = parseFloat(d.after);
        if (ch[k] === undefined && after === now && before !== now) ch[k] = before;
      });
    }
    return {
      id: u.id, kind, race: u.race, ko: u.ko, en: u.en, icon: u.icon, group: kind === "ext" ? "ext" : u.group, ...cur, rng, ch, raw: u, prevBlock: prev,
      producer: kind === "ext" ? tr(cur.producer) : cur.producer, requires: kind === "ext" ? cur.requires.map(tr) : cur.requires,
    };
  };
  const baseRow = (u) => rowOf(u, "base");
  const extRow = (e) => rowOf(e, "ext");
  const rows = () => {
    let r = [];
    if (st.view !== "ext") r = r.concat(B.base.map(baseRow));
    if (st.view !== "base") r = r.concat(B.units.map(extRow));
    const order = { terran: 0, protoss: 1, zerg: 2 };
    r = r.filter((x) => (st.race === "all" || x.race === st.race) && (!st.q || (x.ko + x.en).toLowerCase().includes(st.q.toLowerCase())) && (!st.changed || Object.keys(x.ch).length));
    return r.sort((a, b) => order[a.race] - order[b.race] || (a.kind === b.kind ? 0 : a.kind === "ext" ? -1 : 1));
  };

  /* ---------- cell renderers ---------- */
  const cur = (r, k) => (r.kind === "ext" && r.prov && r.prov[k] === "curated" ? ' class="cur" title="' + t("모드 XML에 값이 없어 수동 정리 값을 사용합니다", "Not in the mod XML; using the hand-curated sheet") + '"' : "");
  const wasHtml = (r, k) => (r.ch[k] !== undefined ? `<span class="was">${esc(r.ch[k])}</span>` : "");
  const wText = (w) => `${w.dmg === null ? "-" : w.dmg}${w.count > 1 ? "×" + w.count : ""}${w.bonus.map((x) => ` (+${x.dmg} ${attrName(x.type)})`).join("")}`;
  const wLine = (w) => {
    const tg = TGT[w.targets] ? t(TGT[w.targets][0], TGT[w.targets][1]) : w.targets;
    return `<div class="wl"><b>${esc(wText(w))}</b><span class="mono"> ${w.cd === null ? "-" : w.cd + "s"} · DPS ${fmt(w.dps)}${w.dpsBonus && w.dpsBonus !== w.dps ? ` (${w.dpsBonus})` : ""}</span><span> ${t("사거리", "range")} ${fmt(w.range)}${tg ? " · " + tg : ""}${w.splash ? ` · ${t("범위", "splash")} ${w.splash}` : ""}</span></div>`;
  };
  const prevWeapons = (r) => (r.ch.weapons ? `<span class="was">${esc(r.ch.weapons.map((w) => wText(w) + " " + t("사거리", "r") + (w.range ?? "-")).join(" / "))}</span>` : "");
  const textWeapons = (r) => `<div class="wl"><b>${t("지상", "Ground")}</b> ${esc(tr(r.text.ground))}</div><div class="wl"><b>${t("공중", "Air")}</b> ${esc(tr(r.text.air))}</div><div class="wl"><span>${t("사거리", "range")} ${fmt(r.rng)} · ${esc(tr(r.text.role))}</span></div>`;
  const combatCell = (r) => (r.weapons && r.weapons.length ? r.weapons.map(wLine).join("") + prevWeapons(r) : r.weapons ? `<span class="mute">${t("공격 없음", "No attack")}</span>` : textWeapons(r));
  const abilCell = (r) => (r.kind === "base"
    ? (r.abilities.length ? r.abilities.map((a) => `<div class="wl"><b>${esc(a.id)}</b><span class="mono"> ${[a.energy != null ? `${t("에너지", "Energy")} ${a.energy}` : "", a.minerals ? `${a.minerals}M` : "", a.gas ? `${a.gas}G` : "", a.cd != null ? `${t("재사용", "CD")} ${a.cd}s` : "", a.range ? `${t("사거리", "range")} ${a.range}` : ""].filter(Boolean).join(" · ")}</span></div>`).join("") : `<span class="mute">-</span>`)
    : `<span class="mute">${t("전용 연구와 능력은 상세에서", "Upgrades and abilities in details")}</span>`);
  const COLS = [
    { k: "name", g: "id", sticky: 1, ko: "유닛", en: "Unit", h: (r) => `<span class="uc">${r.icon ? `<img class="uico" src="${r.icon}" alt="" width="28" height="28">` : `<span class="rtag ${r.race}">${raceGlyph(r.race)}</span>`}<b>${esc(uname(r))}</b></span>` },
    { k: "src", g: "id", ko: "구분", en: "Type", h: (r) => `<span class="src ${r.kind}">${r.kind === "ext" ? "BPM" : t("기본", "Base")}</span>${r.kind === "ext" ? "" : ` <span class="mute">${grpName(r.group)}</span>`}` },
    { k: "minerals", g: "cost", n: 1, ko: "광물", en: "Minerals", h: (r) => esc(fmt(r.cost && r.cost.minerals)) + wasHtml(r, "minerals") },
    { k: "gas", g: "cost", n: 1, ko: "가스", en: "Gas", h: (r) => esc(fmt(r.cost && r.cost.gas)) + wasHtml(r, "gas") },
    { k: "supply", g: "cost", n: 1, ko: "인구", en: "Supply", h: (r) => esc(fmt(r.cost && r.cost.supply)) + wasHtml(r, "supply") },
    { k: "time", g: "cost", n: 1, ko: "생산(초)", en: "Build (s)", h: (r) => esc(fmt(r.cost && r.cost.time)) + wasHtml(r, "time") },
    { k: "producer", g: "cost", ko: "생산 건물", en: "Built at", h: (r) => esc(r.kind === "base" ? loc(fmt(r.producer)) : tr(fmt(r.producer))) },
    { k: "requires", g: "cost", ko: "선행 조건", en: "Requires", w: 1, h: (r) => esc(fmt((r.requires || []).map(r.kind === "base" ? loc : (x) => x).join(", ") || null)) },
    { k: "hp", g: "body", n: 1, ko: "생명력", en: "Health", h: (r) => `<span${cur(r, "hp")}>${r.hp}</span>${wasHtml(r, "hp")}` },
    { k: "shields", g: "body", n: 1, ko: "보호막", en: "Shields", h: (r) => `<span${cur(r, "shields")}>${esc(fmt(r.shields))}</span>${wasHtml(r, "shields")}` },
    { k: "armor", g: "body", n: 1, ko: "방어력", en: "Armor", h: (r) => `<span${cur(r, "armor")}>${esc(fmt(r.armor))}</span>${wasHtml(r, "armor")}` },
    { k: "sarmor", g: "body", n: 1, ko: "보호막 방어", en: "Shield armor", h: (r) => esc(fmt(r.shieldArmor)) },
    { k: "energy", g: "body", n: 1, ko: "에너지", en: "Energy", h: (r) => (r.energy ? `${r.energy.start ?? "-"}/${r.energy.max}` : "-") },
    { k: "speed", g: "body", n: 1, ko: "이동 속도", en: "Speed", h: (r) => `<span${cur(r, "speed")}>${fmt(r.speed)}</span>${wasHtml(r, "speed")}` },
    { k: "sight", g: "body", n: 1, ko: "시야", en: "Sight", h: (r) => `${esc(fmt(r.sight))}${wasHtml(r, "sight")}` },
    { k: "radius", g: "body", n: 1, ko: "반경", en: "Radius", h: (r) => esc(fmt(r.radius)) },
    { k: "cargo", g: "body", n: 1, ko: "수송 칸", en: "Cargo", h: (r) => esc(fmt(r.cargo)) },
    { k: "attrs", g: "body", ko: "속성", en: "Attributes", w: 1, h: (r) => (r.attrs ? esc(r.attrs.map(attrName).join(" · ")) + (r.ch.attrs ? `<span class="was">${esc(r.ch.attrs)}</span>` : "") : "-") },
    { k: "combat", g: "combat", ko: "공격", en: "Attacks", w: 1, wide: 1, h: combatCell },
    { k: "abil", g: "abil", ko: "능력 (XML에 수치가 있는 것만)", en: "Abilities (only those with XML numbers)", w: 1, wide: 1, h: abilCell },
  ];
  const cols = () => COLS.filter((c) => c.g === "id" || st.grp[c.g]);

  const tableHtml = (rs) => {
    const cs = cols();
    let last = null;
    const body = rs.map((r) => {
      const head = r.race !== last ? `<tr class="grp ${r.race}"><th colspan="${cs.length}" scope="colgroup"><span class="rtag ${r.race}">${raceGlyph(r.race)}</span> ${raceName(r.race)}</th></tr>` : "";
      last = r.race;
      return head + `<tr data-id="${r.id}" data-kind="${r.kind}" tabindex="0">${cs.map((c) => `<td class="${c.n ? "n" : ""}${c.w ? " wrapc" : ""}${c.wide ? " wide" : ""}${c.sticky ? " sticky" : ""}">${c.h(r)}</td>`).join("")}</tr>`;
    }).join("");
    return `<div class="tscroll w4t"><table class="tbl wk w4"><thead><tr>${cs.map((c) => `<th class="${c.n ? "n" : ""}${c.sticky ? " sticky" : ""}" scope="col">${t(c.ko, c.en)}</th>`).join("")}</tr></thead><tbody>${body || `<tr><td colspan="${cs.length}" class="empty">${t("조건에 맞는 유닛이 없습니다.", "No units match.")}</td></tr>`}</tbody></table></div>`;
  };
  const cardHtml = (r) => {
    const best = r.weapons && r.weapons.length ? Math.max(0, ...r.weapons.map((w) => w.dpsBonus || w.dps || 0)) || null : null;
    const nch = Object.keys(r.ch).length;
    return `<article class="w3-card ${r.race}"><button class="w3-open" data-open="${r.id}" data-kind="${r.kind}" aria-label="${t("자세히", "Details")}: ${esc(uname(r))}"></button>
      ${nch ? `<span class="w3-chg">${t("변경", "Changed")} ${nch}</span>` : ""}
      ${r.icon ? `<img src="${r.icon}" alt="" width="72" height="72">` : `<span class="rtag ${r.race} big">${raceGlyph(r.race)}</span>`}
      <h3>${esc(uname(r))}</h3><p class="mute"><span class="src ${r.kind}">${r.kind === "ext" ? "BPM" : t("기본", "Base")}</span> ${r.kind === "ext" ? "" : grpName(r.group)}</p>
      <dl><div><dt>HP${r.shields ? "+S" : ""}</dt><dd class="mono">${r.hp}${r.shields ? "+" + r.shields : ""}${wasHtml(r, "hp")}</dd></div><div><dt>${t("방어", "ARM")}</dt><dd class="mono">${fmt(r.armor)}</dd></div><div><dt>${t("속도", "SPD")}</dt><dd class="mono">${fmt(r.speed)}</dd></div><div><dt>${t("비용", "COST")}</dt><dd class="mono">${r.cost.minerals === null || r.cost.minerals === undefined ? "-" : r.cost.minerals + "/" + r.cost.gas}</dd></div></dl>
      ${best ? `<p class="mono w4dps">DPS ${best}</p>` : ""}</article>`;
  };

  /* ---------- details (drawer) ---------- */
  const kv = (l, v, was) => `<div class="kv ${was !== undefined ? "chg" : ""}"><dt>${l}</dt><dd>${v}${was !== undefined ? `<span class="was">${esc(was)}</span>` : ""}</dd></div>`;
  const abilLine = (a) => `<li><b>${esc(a.id)}</b><span class="mono">${[a.energy != null ? `${t("에너지", "Energy")} ${a.energy}` : "", a.minerals ? `${a.minerals}M` : "", a.gas ? `${a.gas}G` : "", a.cd != null ? `${t("재사용", "CD")} ${a.cd}s` : "", a.range ? `${t("사거리", "range")} ${a.range}` : ""].filter(Boolean).join(" · ")}</span></li>`;
  const FIELD = { hp: ["생명력", "Health"], shields: ["보호막", "Shields"], armor: ["방어력", "Armor"], speed: ["이동 속도", "Speed"], sight: ["시야", "Sight"], attrs: ["속성", "Attributes"], weapons: ["무기", "Weapons"], energy: ["에너지", "Energy"], "cost.minerals": ["광물", "Minerals"], "cost.gas": ["가스", "Gas"], "cost.supply": ["인구", "Supply"], "cost.time": ["생산 시간", "Build time"] };
  const provHtml = (r) => {
    if (r.kind !== "ext") return `<p class="vnote">${ico("info")}${t("출처: 기본 게임 밸런스 XML에 BPM 모드 XML의 명시 값을 덮어썼습니다.", "Source: base-game balance XML with the explicit values from the BPM mod XML applied on top.")}</p>`;
    const mod = [], hand = [];
    Object.keys(FIELD).forEach((k) => { const p = r.prov[k]; if (p === "mod") mod.push(t(FIELD[k][0], FIELD[k][1])); else if (p === "curated" || (p === undefined && k !== "energy")) hand.push(t(FIELD[k][0], FIELD[k][1])); });
    return `<div class="prov"><h4>${t("값의 출처", "Where the numbers come from")}</h4><p><b>${t("모드 XML에 명시", "Set in the mod XML")}</b> ${esc(mod.join(", ") || "-")}</p><p><b>${t("XML에 없음 (캠페인/의존성 상속, 수동 정리 값 사용)", "Not in the XML (inherited from dependencies; hand-curated value shown)")}</b> ${esc(hand.join(", ") || "-")}</p></div>`;
  };
  const detailRow = (r) => `<div class="det"><div class="det-h">${r.icon ? `<img src="${r.icon}" alt="" width="56" height="56">` : ""}<div><h3>${esc(uname(r))}</h3><p class="mute">${raceName(r.race)} · ${r.kind === "ext" ? t("BPM 추가 유닛", "BPM added unit") : t("기본 게임 유닛", "Base-game unit") + " · " + grpName(r.group)}</p></div></div>
    <dl class="det-g">${kv(t("광물", "Minerals"), fmt(r.cost.minerals), r.ch.minerals)}${kv(t("가스", "Gas"), fmt(r.cost.gas), r.ch.gas)}${kv(t("인구", "Supply"), fmt(r.cost.supply), r.ch.supply)}${kv(r.timeKind === "morph" ? t("변태(초)", "Morph (s)") : t("생산(초)", "Build (s)"), fmt(r.cost.time), r.ch.time)}
      ${kv(t("생명력", "Health"), fmt(r.hp), r.ch.hp)}${kv(t("보호막", "Shields"), fmt(r.shields), r.ch.shields)}${kv(t("방어력", "Armor"), fmt(r.armor), r.ch.armor)}${kv(t("보호막 방어", "Shield armor"), fmt(r.shieldArmor))}
      ${kv(t("이동 속도", "Speed"), fmt(r.speed), r.ch.speed)}${kv(t("시야", "Sight"), fmt(r.sight), r.ch.sight)}${kv(t("반경", "Radius"), fmt(r.radius))}${kv(t("수송 칸", "Cargo"), fmt(r.cargo))}${r.energy ? kv(t("에너지", "Energy"), `${r.energy.start ?? "-"}/${r.energy.max}`) : ""}</dl>
    <dl class="det-l">${kv(t("속성", "Attributes"), esc(r.attrs ? r.attrs.map(attrName).join(" · ") : "-"), r.ch.attrs)}${kv(t("이동 방식", "Movement"), esc(loc(r.move || "-")))}${kv(t("생산 건물", "Built at"), esc(r.kind === "ext" ? fmt(r.producer) : loc(fmt(r.producer))))}${kv(t("선행 조건", "Requires"), esc(fmt((r.requires || []).map(r.kind === "ext" ? (x) => x : loc).join(", ") || null)))}</dl>
    <h4>${t("무기", "Weapons")}</h4>${r.weapons && r.weapons.length ? `<div class="tscroll"><table class="tbl det-t"><thead><tr><th>${t("무기", "Weapon")}</th><th class="n">${t("피해", "Dmg")}</th><th>${t("보너스", "Bonus")}</th><th class="n">${t("횟수", "Hits")}</th><th class="n">${t("쿨다운", "CD")}</th><th class="n">DPS</th><th class="n">${t("사거리", "Range")}</th><th>${t("대상", "Targets")}</th></tr></thead><tbody>${r.weapons.map((x) => `<tr><td>${esc(x.id)}</td><td class="n mono">${fmt(x.dmg)}</td><td>${x.bonus.map((y) => `+${y.dmg} ${attrName(y.type)}`).join(", ") || "-"}</td><td class="n mono">${x.count}</td><td class="n mono">${x.cd === null ? "-" : x.cd + "s"}</td><td class="n mono">${fmt(x.dps)}${x.dpsBonus && x.dpsBonus !== x.dps ? ` (${x.dpsBonus})` : ""}</td><td class="n mono">${fmt(x.range)}</td><td>${TGT[x.targets] ? t(TGT[x.targets][0], TGT[x.targets][1]) : esc(fmt(x.targets))}</td></tr>`).join("")}</tbody></table></div>${r.prov.weapons === "partial" ? `<p class="vnote">${ico("info")}${t("쿨다운이나 피해 일부는 의존성에서 상속되어 모드 XML에 없습니다.", "Some cooldown or damage values are inherited from dependencies and absent from the mod XML.")}</p>` : ""}${r.ch.weapons ? `<p class="vnote">${ico("clock-counter-clockwise")}${t("이전 빌드", "Previous build")}: ${esc(r.ch.weapons.map((x) => wText(x) + " " + t("사거리", "range") + " " + fmt(x.range)).join(" / "))}</p>` : ""}` : r.weapons ? `<p class="mute">${t("공격 없음", "No attack")}</p>` : textWeapons(r)}
    ${r.abilities && r.abilities.length ? `<h4>${t("능력", "Abilities")}</h4><ul class="det-u">${r.abilities.map(abilLine).join("")}</ul>` : ""}
    ${r.kind === "ext" && r.raw.diff.length ? `<h4>${t("기본 유닛과의 차이", "Versus the base unit")}</h4><table class="tbl det-t"><thead><tr><th>${t("항목", "Item")}</th><th>${esc(t(r.raw.pairKo, r.raw.pairEn))}</th><th>${esc(uname(r))}</th></tr></thead><tbody>${r.raw.diff.map((d) => `<tr><td>${esc(tr(d.item))}</td><td class="wrapc">${esc(tr(d.pair))}</td><td class="wrapc"><b>${esc(tr(d.unit))}</b></td></tr>`).join("")}</tbody></table>` : ""}
    ${r.kind === "ext" && r.raw.upgrades.length ? `<h4>${t("전용 업그레이드", "Upgrades")}</h4><ul class="det-u">${r.raw.upgrades.map((g) => `<li><b>${esc(tr(g.name))}</b><span class="mono">${esc(g.cost)}</span><span>${esc(tr(g.building))}</span><span>${esc(tr(g.statDiff))}</span></li>`).join("")}</ul>` : ""}
    ${provHtml(r)}</div>`;
  const detail = (id, kind) => detailRow(kind === "ext" ? extRow(B.units.find((u) => u.id === id)) : baseRow(B.base.find((u) => u.id === id)));

  /* ---------- BPM added units: pair view ---------- */
  const PAIRSTAT = [
    ["hp", t("생명력", "Health"), (r) => r.hp], ["shields", t("보호막", "Shields"), (r) => r.shields], ["armor", t("방어력", "Armor"), (r) => r.armor], ["speed", t("이동 속도", "Speed"), (r) => r.speed],
    ["rng", t("사거리", "Range"), (r) => r.rng], ["minerals", t("광물", "Minerals"), (r) => r.cost.minerals], ["gas", t("가스", "Gas"), (r) => r.cost.gas], ["supply", t("인구", "Supply"), (r) => r.cost.supply], ["time", t("생산(초)", "Build (s)"), (r) => r.cost.time],
  ];
  const pairHtml = (e) => {
    const x = extRow(e), b = baseRow(B.base.find((u) => u.id === e.pairId));
    const rowsH = PAIRSTAT.map(([k, l, f]) => {
      const bv = f(b), xv = f(x), d = delta(bv, xv), chg = x.ch[k] !== undefined;
      return `<div class="pr ${chg ? "chg" : ""}"><span class="pb mono">${fmt(bv)}</span><span class="pl">${l}${chg ? ` <em>${t("v1.4.3 변경", "changed in v1.4.3")}</em>` : ""}</span><span class="px mono">${fmt(xv)}${chg ? `<span class="was">${esc(x.ch[k])}</span>` : ""}</span><span class="pd">${bv === xv ? "" : `<span class="diff ${d.dir}">${d.label}</span>`}</span></div>`;
    }).join("");
    const nch = Object.keys(x.ch).length;
    return `<article class="pair ${e.race}" id="${e.id}">
      <header><button class="pu" data-open="${b.id}" data-kind="base"><img src="${b.icon}" alt="" width="56" height="56"><span><b>${esc(uname(b))}</b><small>${t("기본 유닛", "Base unit")}</small></span></button>
        <span class="pvs">VS</span>
        <button class="pu ext" data-open="${e.id}" data-kind="ext"><img src="${e.icon}" alt="" width="56" height="56"><span><b>${esc(uname(e))}</b><small>${t("BPM 추가", "BPM added")}${nch ? ` · ${t("변경", "changed")} ${nch}` : ""}</small></span></button></header>
      <div class="prs">${rowsH}</div>
      <details><summary>${t("역할 차이와 전용 업그레이드", "Role differences and upgrades")}</summary>
        <table class="tbl det-t"><thead><tr><th>${t("항목", "Item")}</th><th>${esc(uname(b))}</th><th>${esc(uname(e))}</th></tr></thead><tbody>${e.diff.map((d) => `<tr><td>${esc(tr(d.item))}</td><td class="wrapc">${esc(tr(d.pair))}</td><td class="wrapc"><b>${esc(tr(d.unit))}</b></td></tr>`).join("")}</tbody></table>
        ${e.upgrades.length ? `<ul class="det-u">${e.upgrades.map((g) => `<li><b>${esc(tr(g.name))}</b><span class="mono">${esc(g.cost)}</span><span>${esc(tr(g.building))}</span><span>${esc(tr(g.statDiff))}</span></li>`).join("")}</ul>` : ""}
      </details></article>`;
  };

  const srcNote = () => `<p class="vnote">${ico("file-code")}${st.ver === "v1.4.3" ? t("수치 출처", "Source") + ": " + esc(B.modInfo.current) : t("이전 빌드 수치는 ", "Previous-build numbers come from ") + esc(B.modInfo.previous) + t("에서 추출했습니다.", ".")} <span class="cur">${t("점선 밑줄", "Dotted")}</span> ${t("= 모드 XML에 값이 없어 수동 정리 값을 사용", "= not in the mod XML; hand-curated value")}</p>`;
  /* ---------- page ---------- */
  const seg = (attr, items, cur) => `<div class="seg" role="group">${items.map(([v, l]) => `<button data-${attr}="${v}" aria-pressed="${cur === v}">${l}</button>`).join("")}</div>`;
  S.wiki[4] = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (["terran", "protoss", "zerg"].includes(h)) st.race = h;
    else if (B.units.find((u) => u.id === h)) { st.open = { id: h, kind: "ext" }; st.view = "ext"; }
    else if (B.base.find((u) => u.id === h)) st.open = { id: h, kind: "base" };
    return {
      html: `<section class="wrap w3 w4p"><header class="pg-h"><h1 class="h1">${t("유닛 위키", "Unit wiki")}</h1><p class="lede">${t("기본 게임 유닛 전체와 BPM 추가 유닛 17종의 수치를 한곳에서 봅니다. 모든 열이 기본으로 펼쳐져 있습니다.", "Every base-game unit and the 17 BPM added units in one place. All columns are open by default.")}</p></header>
        <div data-bar></div><div data-main></div></section><aside class="w3-drawer" data-drawer aria-hidden="true"></aside>`,
      mount(root) {
        const bar = root.querySelector("[data-bar]"), main = root.querySelector("[data-main]"), dr = root.querySelector("[data-drawer]");
        const openDrawer = (id, kind) => { dr.innerHTML = `<button class="w3-x" data-x aria-label="${t("닫기", "Close")}">${ico("x")}</button>${detail(id, kind)}`; dr.classList.add("open"); dr.setAttribute("aria-hidden", "false"); const x = dr.querySelector("[data-x]"); x.focus(); x.addEventListener("click", closeDrawer); };
        const closeDrawer = () => { dr.classList.remove("open"); dr.setAttribute("aria-hidden", "true"); };
        document.onkeydown = (e) => { if (e.key === "Escape") closeDrawer(); };
        const nAll = B.base.length + B.units.length;
        const bindOpen = () => {
          main.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openDrawer(b.dataset.open, b.dataset.kind)));
          main.querySelectorAll("tbody tr[data-id]").forEach((r) => { const go = () => openDrawer(r.dataset.id, r.dataset.kind); r.addEventListener("click", go); r.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); }); });
        };
        const rest = () => {
          const rs = rows();
          if (st.view === "ext") {
            const es = B.units.filter((e) => (st.race === "all" || e.race === st.race) && (!st.q || (e.ko + e.en).toLowerCase().includes(st.q.toLowerCase())) && (!st.changed || Object.keys(extRow(e).ch).length));
            main.innerHTML = `<p class="vnote">${ico("info")}${t("왼쪽이 대체되는 기본 유닛, 오른쪽이 BPM 추가 유닛입니다. 칩은 기본 유닛 대비 변화량입니다.", "Left is the base unit it replaces, right is the BPM unit. Chips show the change versus the base unit.")}</p>
              ${["terran", "protoss", "zerg"].filter((r) => es.some((e) => e.race === r)).map((r) => `<section class="w3-race ${r}" id="${r}"><h2>${raceName(r)}</h2><div class="pairs">${es.filter((e) => e.race === r).map(pairHtml).join("")}</div></section>`).join("") || `<p class="empty">${t("조건에 맞는 유닛이 없습니다.", "No units match.")}</p>`}`;
          } else if (st.mode === "cards") {
            main.innerHTML = `<p class="vnote">${ico("list-numbers")}${rs.length} ${t("개 유닛", "units")}</p>` + ["terran", "protoss", "zerg"].filter((r) => rs.some((x) => x.race === r)).map((r) => `<section class="w3-race ${r}" id="${r}"><h2>${raceName(r)}</h2><div class="w3-cards">${rs.filter((x) => x.race === r).map(cardHtml).join("")}</div></section>`).join("");
          } else {
            main.innerHTML = `<p class="vnote">${ico("list-numbers")}${rs.length} ${t("개 유닛", "units")} · ${t("행을 누르면 모든 무기·능력이 있는 상세가 열립니다.", "Click a row for full weapons and abilities.")}</p>${srcNote()}${tableHtml(rs)}`;
          }
          bindOpen();
        };
        const draw = () => {
          bar.innerHTML = `<div class="wtool">${seg("view", [["all", `${t("전체", "All")} <span class="mono">${nAll}</span>`], ["ext", `${t("BPM 추가 유닛", "BPM added")} <span class="mono">${B.units.length}</span>`], ["base", `${t("기본 유닛", "Base")} <span class="mono">${B.base.length}</span>`]], st.view)}
            ${seg("race", [["all", t("전체", "All")], ["terran", raceName("terran")], ["protoss", raceName("protoss")], ["zerg", raceName("zerg")]], st.race)}
            ${seg("ver", [["v1.4.3", t("v1.4.3 현재", "v1.4.3 current")], ["v1.4.1", t("v1.4.1 직전", "v1.4.1 previous")]], st.ver)}
            <button class="chip" data-chg aria-pressed="${st.changed}">${ico(st.changed ? "check" : "plus")}${t("v1.4.3 변경만", "Changed only")}</button>
            ${st.view === "ext" ? "" : seg("mode", [["table", `${ico("table")}${t("표", "Table")}`], ["cards", `${ico("squares-four")}${t("카드", "Cards")}`]], st.mode)}
            ${st.view !== "ext" && st.mode === "table" ? `<div class="grpchips">${[["cost", t("비용·건물", "Cost")], ["body", t("몸체", "Body")], ["combat", t("공격", "Attacks")], ["abil", t("능력", "Abilities")]].map(([g, l]) => `<button class="chip" data-grp="${g}" aria-pressed="${st.grp[g]}">${st.grp[g] ? ico("check") : ico("plus")}${l}</button>`).join("")}</div>` : ""}
            <div class="wsearch">${ico("magnifying-glass")}<input class="inp" type="search" data-q value="${esc(st.q)}" placeholder="${t("유닛 이름 검색", "Search units")}" aria-label="${t("유닛 검색", "Search units")}"></div></div>`;
          bar.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => { st.view = b.dataset.view; draw(); }));
          bar.querySelectorAll("[data-race]").forEach((b) => b.addEventListener("click", () => { st.race = b.dataset.race; draw(); }));
          bar.querySelectorAll("[data-ver]").forEach((b) => b.addEventListener("click", () => { st.ver = b.dataset.ver; draw(); }));
          bar.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { st.mode = b.dataset.mode; draw(); }));
          bar.querySelectorAll("[data-grp]").forEach((b) => b.addEventListener("click", () => { st.grp[b.dataset.grp] = !st.grp[b.dataset.grp]; draw(); }));
          bar.querySelector("[data-chg]").addEventListener("click", () => { st.changed = !st.changed; draw(); });
          const q = bar.querySelector("[data-q]"); q.addEventListener("input", () => { st.q = q.value; rest(); });
          rest();
        };
        draw();
        if (st.open) { openDrawer(st.open.id, st.open.kind); st.open = null; }
      },
    };
  };
})();
