// Site data builder. Run: node tools/build-data.js (needs ffmpeg for the base-game icons)
// Merges the real site JSON into one window.BPM payload so the static mock pages work from file://.
const fs = require("fs");
const path = require("path");
const D = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", f), "utf8"));

const units = D("units.json");
const modified = D("modified_units.json");
const tutorials = D("tutorials.json");
const maps = D("maps.json");
const meta = D("site_meta.json");
const patchesOld = D("patches.json");

// ---- EN names / KO->EN glossary (lab-only; the real schema will carry both languages) ----
const glossary = [
  ["모든 피해 면역", "Immune to all damage"], ["원거리 50%, 근접 30% 감소", "Ranged -50%, melee -30%"],
  ["경장갑", "Light"], ["중장갑", "Armored"], ["기계", "Mechanical"], ["단일", "single"],
  ["회 타격", " hits"], ["2회 연속 타격, 총 40 산성 폭격", "2 hits, 40 total acid bombardment"],
  ["광역 방사", "splash"], ["대공/지상 올라운더", "Air/ground all-rounder"],
  ["업 시 8사거리", "range 8 when upgraded"], ["업그레이드", "upgrade"],
  ["방사 피해", "splash damage"], ["피격 반사 오라", "damage-reflect aura"],
  ["초", "s"], ["병영 기술실", "Barracks Tech Lab"], ["병영", "Barracks"], ["군수공장", "Factory"],
  ["우주공항", "Starport"], ["기술실", "Tech Lab"], ["무기고", "Armory"], ["필요", "required"],
  ["BPM 평타 무기", "BPM basic weapon"], ["A무빙 호신용", "A-move self-defense"],
  ["마법 지원", "Support caster"], ["전술 마법", "Tactical caster"], ["에너지", "Energy"],
  ["대형 보행 브루저", "Heavy walking bruiser"], ["장거리 고화력 공성 폭격", "Long-range siege bombardment"],
  ["장거리 중장갑 저격", "Long-range anti-armor sniper"], ["기계 특화 탱커", "Anti-mech tank"],
  ["최종 전선 파쇄 괴수", "Frontline-breaker monster"], ["공중 비행 마법", "Flying caster"],
  ["원거리 속사 소총", "Rapid-fire rifle"], ["초근접 경장갑 광역 방사 화염 타격", "Close-range flame splash"],
];
const enName = (n) => (n.match(/\(([^)]+)\)/) || [])[1] || n;
const koName = (n) => n.replace(/\s*\([^)]+\)/, "");

const unitsOut = units.map((u) => ({
  id: u.id, race: u.race, icon: "assets/images/icons/" + path.basename(u.icon),
  ko: koName(u.name), en: enName(u.name),
  pairKo: koName(u.pairUnit), pairEn: enName(u.pairUnit),
  buildingKo: u.building, techKo: u.techReq,
  cost: u.cost, stats: u.stats,
  diff: u.diffFromPair, upgrades: u.upgrades,
}));

// ---- Version axis. units.json is the v1.4.1 baseline; v1.4.3 overrides are from docs/v1.4.3 patch notes ----
const overrides = {
  "v1.4.3": {
    firebat: { stats: { hp: 75 } },
    goliath: { stats: { groundDmg: "21 (단일)" } },
    aberration: { stats: { hp: 200, range: 1.75, groundDmg: "15 (+15 vs 중장갑)" }, cost: { supply: 2 } },
    guardian: { stats: { hp: 200, speed: 2.2 } },
    defiler: { cost: { gas: 200, time: 34 } },
  },
};

const versions = [
  { id: "v1.4.3", status: "current", date: null },
  { id: "v1.4.1", status: "previous", date: "2026-09-14" },
];

// Structured diff rows (before/after) so patch pages and wiki share one record format.
const R = (race, unit, ko, en, before, after, unitId) => ({ race, unit, ko, en, before, after, unitId });
const diffs = {
  "v1.4.3": [
    R("terran", "Firebat", "생명력", "Health", "100", "75", "firebat"),
    R("terran", "Firebat", "방어 속성", "Armor type", "중장갑", "경장갑", "firebat"),
    R("terran", "Marauder", "생명력", "Health", "125", "100"),
    R("terran", "Marauder", "방어 속성", "Armor type", "중장갑", "경장갑"),
    R("terran", "WarHound", "폭주 미사일 추가 피해", "Haywire Missile bonus damage", "30", "20", "warhound"),
    R("terran", "WarHound", "폭주 미사일 연구", "Haywire Missile research", "100/100/110초", "150/150/79초", "warhound"),
    R("terran", "Science Vessel", "이레디에이트 에너지", "Irradiate energy", "25", "75", "science_vessel"),
    R("terran", "Science Vessel", "디펜시브 매트릭스 에너지", "Defensive Matrix energy", "100", "50", "science_vessel"),
    R("terran", "Science Vessel", "디펜시브 매트릭스 범위", "Defensive Matrix radius", "1.5", "1.75", "science_vessel"),
    R("terran", "Science Vessel", "디펜시브 매트릭스 흡수량", "Defensive Matrix absorb", "16", "24", "science_vessel"),
    R("zerg", "Aberration", "생명력", "Health", "275", "200", "aberration"),
    R("zerg", "Aberration", "공격력", "Damage", "20 (+20 중장갑)", "15 (+15 중장갑)", "aberration"),
    R("zerg", "Aberration", "사거리", "Range", "1.25", "1.75", "aberration"),
    R("zerg", "Aberration", "인구수", "Supply", "3", "2", "aberration"),
    R("zerg", "Defiler", "생산 비용·시간", "Cost and build time", "50/150/40초", "50/200/34초", "defiler"),
    R("zerg", "Defiler", "다크 스웜", "Dark Swarm", "모든 피해 면역", "원거리 50%, 근접 30% 감소", "defiler"),
    R("zerg", "Guardian", "생명력", "Health", "150", "200", "guardian"),
    R("zerg", "Guardian", "이동 속도", "Speed", "1.97", "2.2", "guardian"),
    R("terran", "Goliath", "지상 공격력", "Ground damage", "18", "21", "goliath"),
    R("terran", "WarHound", "폭주 미사일 대상", "Haywire Missile targets", "기계", "기계 또는 중장갑", "warhound"),
    R("terran", "Raven", "방해 매트릭스", "Interference Matrix", "있음", "삭제"),
    R("terran", "Science Vessel", "이레디에이트 사거리", "Irradiate range", "9", "8", "science_vessel"),
    R("terran", "Science Vessel", "이레디에이트 방사 반경", "Irradiate splash radius", "1.5", "0.5", "science_vessel"),
    R("terran", "Science Vessel", "이레디에이트 지속시간", "Irradiate duration", "21.4초", "15초", "science_vessel"),
    R("zerg", "Aberration", "근접 업그레이드당 피해", "Damage per melee upgrade", "-", "+2 (기본·중장갑 동일)", "aberration"),
    R("zerg", "Ravager", "생명력", "Health", "120", "150"),
    R("zerg", "Ravager", "인구수", "Supply", "3", "2"),
    R("zerg", "Ravager", "변태 비용", "Morph cost", "25/75", "50/50"),
    R("zerg", "Ravager", "변태 시간", "Morph time", "12.14초", "8.57초"),
    R("zerg", "Ravager", "부식성 담즙 재사용", "Corrosive Bile cooldown", "7.14초", "6.5초"),
    R("zerg", "Ravasaur", "방어 속성", "Armor type", "중장갑", "경장갑", "ravasaur"),
    R("zerg", "Ravasaur", "공격력", "Damage", "10 (+15 중장갑)", "10 (+10 중장갑)", "ravasaur"),
    R("zerg", "Ravasaur", "미사일 업그레이드당 피해", "Damage per missile upgrade", "-", "+2", "ravasaur"),
    R("zerg", "Defiler", "공격 능력", "Attack", "없음", "지상 전용 (피해 5, 사거리 10, 주기 1.5초)", "defiler"),
    R("zerg", "Defiler", "다크 스웜 적용 대상", "Dark Swarm affects", "-", "아군·동맹만 (반경 3.5)", "defiler"),
    R("zerg", "Viper", "공격 대상", "Attack targets", "공중+지상", "지상만 (피해 1, 사거리 10)"),
    R("zerg", "Tyrannozor", "공격 방식", "Attack pattern", "단일 대상", "범위 피해 (전방 아크 반경 2, 범위 대상 33%)", "tyrannozor"),
    R("zerg", "Tyrannozor", "흡혈", "Life steal", "없음", "적중당 생명력 +7", "tyrannozor"),
  ],
};

const UKO = { Firebat: "파이어뱃", Marauder: "불곰", WarHound: "투견", "Science Vessel": "사이언스 베슬", Aberration: "변형체", Defiler: "디파일러", Guardian: "가디언", Goliath: "골리앗", Raven: "밤까마귀", Ravager: "궤멸충", Ravasaur: "라바사우르스", Viper: "살모사", Queen: "여왕", Tyrannozor: "티라노조르", "Siege Tank": "공성전차", Thor: "토르" };
const UM = { Firebat: ["terran", "firebat"], Marauder: ["terran"], WarHound: ["terran", "warhound"], Goliath: ["terran", "goliath"], "Siege Tank": ["terran"], Thor: ["terran"], Raven: ["terran"], "Science Vessel": ["terran", "science_vessel"], Aberration: ["zerg", "aberration"], Ravager: ["zerg"], Ravasaur: ["zerg", "ravasaur"], Defiler: ["zerg", "defiler"], Viper: ["zerg"], Queen: ["zerg", "queen"], Tyrannozor: ["zerg", "tyrannozor"], Guardian: ["zerg", "guardian"] };
const U = (...names) => names.map((n) => ({ unit: n, unitKo: UKO[n], race: UM[n][0], unitId: UM[n][1] }));
diffs["v1.4.3"].forEach((d) => (d.unitKo = UKO[d.unit] || d.unit));
// Hand-translated headline copy for the patch pages (KO source: docs/v1.4.3 patch notes.md, data/patches.json)
const patches = [
  {
    version: "v1.4.3", status: "current", date: null,
    titleKo: "전투 역할 재정립과 스네이크 밴", titleEn: "Combat roles reworked, snake ban order",
    sumKo: "보병 전열은 초반 내구도를 낮추는 대신 연구 선택으로 화력이나 중장갑 전환을 고를 수 있습니다. 신규 연구 8종과 파라사이트가 추가되고, 밴 순서에 스네이크 방식이 생겼으며 필수 탐지·수송 유닛은 밴 풀에서 빠졌습니다.",
    sumEn: "Infantry trades early durability for research-driven firepower or armor conversion. Eight new researches and Parasite are added, snake ban order arrives, and detection and transport units leave the ban pool.",
    noteKo: "BPM_Core_v2 모드 XML의 최종 값 기준입니다. 이레디에이트 지속시간과 상태 표시는 v1.5에서 추가 적용된 항목이 v2에 포함된 것입니다.",
    noteEn: "Values follow the final BPM_Core_v2 mod XML. Irradiate duration and status indicators were added in v1.5 and are included in v2.",
    highlights: [
      { ko: "신규 연구 8종: 분쇄탄, 네이팜 탄창, 보병 중장갑, 크루시오 완충기, 요새화 프로토콜, 통합 화력 관제망, 과학선 부스트, 원시 허물 진화", en: "Eight new researches: Shatter Shells, Napalm Canister, Infantry Heavy Armor, Crucio Suppressor, Fortification Protocol, Integrated Fire Control Network, Science Vessel Boost, Primal Molt Evolution" },
      { ko: "여왕에 파라사이트 추가, 밤까마귀 방해 매트릭스 삭제와 수리 비행정 조정", en: "Queen gains Parasite; Raven loses Interference Matrix and its Repair Drone is tuned" },
      { ko: "스네이크 밴: 3밴은 1→2→2→1→1→2, 5밴은 1→2→2→1→1→2→2→1→1→2", en: "Snake ban: 3 bans run 1→2→2→1→1→2, 5 bans run 1→2→2→1→1→2→2→1→1→2" },
      { ko: "관측선·의료선·차원 분광기는 밴 풀에서 제외", en: "Observer, Medivac and Warp Prism are removed from the ban pool" },
      { ko: "이레디에이트와 파라사이트 대상에 빨간 후광과 붉은 틴트 표시", en: "Irradiate and Parasite targets get a red halo and red tint" },
    ],
    fixes: [
      { ko: "골리앗 등 일부 추가 유닛에 공업·방업이 적용되지 않던 문제", en: "Attack/armor upgrades not applying to Goliath and some extension units" },
      { ko: "디펜시브 매트릭스 시전 범위 표시", en: "Defensive Matrix cast range indicator" },
      { ko: "부식성 담즙 버튼 표시, 감염충 버튼·단축키 중복, 애벌레 단축키 충돌", en: "Corrosive Bile button, Infestor button and hotkey overlap, Larva hotkey conflicts" },
      { ko: "티라노조르 공격 애니메이션, 디파일러 마운드 건설 중 액터, 사용 완료 점막 액터 전환", en: "Tyrannozor attack animation, Defiler Mound under-construction actor, spent creep actor swap" },
      { ko: "여왕의 점막 밖 이동 속도가 점막 위 속도로 유지되던 문제", en: "Queen keeping creep speed off creep" },
      { ko: "프로토스 공중 공방업 버튼, 로보틱스·관문 생산 버튼 노출", en: "Protoss air upgrade buttons and Robotics/Gateway production button display" },
      { ko: "밴픽 종료 후 타이머가 초기화되지 않던 문제", en: "Draft timer not resetting after the draft ends" },
      { ko: "파이어뱃 화염방사기가 캠페인 무기와 중복 장착되던 문제와 시선 보정 오류", en: "Firebat flamethrower stacking with the inherited campaign weapon, and facing correction" },
      { ko: "파라사이트 시야 공개 방식 수정", en: "Parasite vision reveal fixed" },
      { ko: "사이언스 베슬 명령 카드에 캠페인 EMP·나노 수리가 노출되지 않도록 재구성", en: "Science Vessel command card rebuilt so campaign EMP and Nano Repair no longer leak in" },
    ],
    known: [
      { ko: "동력기 위상 모드 전환 시 모델이 올바르게 바뀌지 않음 (게임플레이 영향 없음)", en: "Energizer model does not swap correctly in phase mode (no gameplay effect)" },
      { ko: "일부 유닛의 생산 자원 툴팁이 흰색으로 표시될 수 있음", en: "Some production resource tooltips may show in white" },
    ],
    diffs: diffs["v1.4.3"],
    upgrades: [
      { units: U("Marauder"), kind: "research", icon: "terran-shatter-shells", ko: "분쇄탄", en: "Shatter Shells", whereKo: "병영 기술실", whereEn: "Barracks Tech Lab", cost: "100/100", time: 79, reqKo: "충격탄 연구, 유령 사관학교", reqEn: "Concussive Shells, Ghost Academy", effKo: "충격탄 명중 시 반경 1.5 안의 적(지상)을 둔화시킵니다. 연구 후에만 적용됩니다.", effEn: "Concussive shells slow ground enemies within radius 1.5 of the hit. Applies only after the research." },
      { units: U("Firebat"), kind: "research", icon: "terran-napalm-canister", ko: "네이팜 탄창", en: "Napalm Canister", whereKo: "병영 기술실", whereEn: "Barracks Tech Lab", cost: "100/100", time: 79, reqKo: "-", reqEn: "-", effKo: "경장갑 대상 피해 +5, 사거리 +2, 공격 주기 -0.2초 (1.3125초 → 1.1125초).", effEn: "+5 damage vs Light, +2 range, attack period -0.2s (1.3125s to 1.1125s)." },
      { units: U("Firebat", "Marauder"), kind: "research", icon: "terran-infantry-heavy-armor", ko: "보병 중장갑", en: "Infantry Heavy Armor", whereKo: "병영 기술실", whereEn: "Barracks Tech Lab", cost: "150/150", time: 79, reqKo: "-", reqEn: "-", effKo: "파이어뱃 생명력 75 → 100, 불곰 100 → 125, 둘 다 중장갑으로 전환됩니다. 전환 후 방어력은 파이어뱃 2, 불곰 1. 연구 후 생산되는 유닛도 같은 방식으로 전환됩니다.", effEn: "Firebat health 75 to 100, Marauder 100 to 125, both become Armored. Armor after conversion: Firebat 2, Marauder 1. Units produced afterwards convert the same way." },
      { units: U("Siege Tank"), kind: "research", icon: "terran-crucio-dampener", ko: "크루시오 완충기", en: "Crucio Suppressor", whereKo: "군수공장 기술실", whereEn: "Factory Tech Lab", cost: "100/100", time: 79, reqKo: "무기고", reqEn: "Armory", effKo: "공성 모드의 아군 대상 피해가 25%만 적용됩니다 (75% 감소). 적에게 주는 피해는 그대로입니다.", effEn: "Sieged mode deals only 25% damage to friendly units (75% reduction). Damage to enemies is unchanged." },
      { units: U("Thor"), kind: "research", icon: "terran-fortification-protocol", ko: "요새화 프로토콜", en: "Fortification Protocol", whereKo: "무기고", whereEn: "Armory", cost: "100/100", time: 85, reqKo: "융합로", reqEn: "Fusion Core", effKo: "생명력을 모두 잃으면 한 번 재건설 가능 상태가 되고, 건설로봇이 10초간 수리하면 최대 생명력의 70%로 부활합니다.", effEn: "When it loses all health it can be rebuilt once: after an SCV repairs for 10s it revives with 70% of max health." },
      { units: U("Raven"), kind: "research", icon: "terran-integrated-fire-control-network", ko: "통합 화력 관제망", en: "Integrated Fire Control Network", whereKo: "우주공항 기술실", whereEn: "Starport Tech Lab", cost: "150/150", time: 79, reqKo: "-", reqEn: "-", effKo: "연구하면 능력을 사용할 수 있습니다 (에너지 50, 사거리 9). 지점을 지정하면 반경 3 영역이 20초간 유지되고 영역 안의 적 1기를 자동 표적으로 삼습니다. 표적은 받는 피해가 20% 증가하며(근접·원거리 모두, 장갑 무관), 영역이나 사거리 2를 벗어나면 1.25초 뒤 해제됩니다.", effEn: "Unlocks the ability (50 energy, range 9). Target a point: a radius-3 zone lasts 20s and auto-marks one enemy inside. The mark takes 20% more damage (melee and ranged, armor-independent) and drops 1.25s after leaving the zone or range 2." },
      { units: U("Raven"), kind: "ability", icon: "", ko: "수리 비행정", en: "Repair Drone", whereKo: "능력 (에너지 50)", whereEn: "Ability (50 energy)", cost: "-", time: null, reqKo: "-", reqEn: "-", effKo: "수리 유닛 생명력 50, 지속 90초, 에너지 200, 회복 속도 13.6. 변경 전 수치가 문서에 없어 증가폭은 적지 않았습니다.", effEn: "Drone health 50, lasts 90s, 200 energy, repair rate 13.6. The previous values are not on record, so the size of the change is not listed." },
      { units: U("Science Vessel"), kind: "research", icon: "terran-science-vessel-boost", ko: "과학선 부스트", en: "Science Vessel Boost", whereKo: "우주공항 기술실", whereEn: "Starport Tech Lab", cost: "100/100", time: 100, reqKo: "-", reqEn: "-", effKo: "사용하면 6초간 이동 속도가 2배가 됩니다. 재사용 14초, 에너지 소모 없음.", effEn: "Doubles movement speed for 6s. 14s cooldown, no energy cost." },
      { units: U("Tyrannozor"), kind: "research", icon: "zerg-primal-molt-evolution", ko: "원시 허물 진화", en: "Primal Molt Evolution", whereKo: "울트라리스크 동굴", whereEn: "Ultralisk Cavern", cost: "150/150", time: 90, reqKo: "-", reqEn: "-", effKo: "티라노조르 방어력 +1. 티라노조르를 선택했고 동굴이 완성된 경우에만 버튼이 표시됩니다.", effEn: "+1 armor for Tyrannozor. The button shows only if you picked Tyrannozor and the cavern is finished." },
      { units: U("Queen"), kind: "ability", icon: "zerg-parasite", ko: "파라사이트", en: "Parasite", whereKo: "능력 (에너지 75)", whereEn: "Ability (75 energy)", cost: "-", time: null, reqKo: "-", reqEn: "-", effKo: "사거리 9. 대상의 시야를 시전한 플레이어에게 공개합니다. 지속시간은 없으며 대상이 죽을 때까지 유지됩니다. 대상에게는 초록 구름과 빨간 후광이 표시됩니다.", effEn: "Range 9. Reveals the target's vision to the caster. No duration: lasts until the target dies. The target shows a green cloud and a red halo." },
    ],
    sys: [
      { ko: "시스템·편의성", en: "System and convenience", items: [
        { ko: "스네이크 밴: 3밴 1→2→2→1→1→2, 5밴 1→2→2→1→1→2→2→1→1→2", en: "Snake ban: 3 bans 1→2→2→1→1→2, 5 bans 1→2→2→1→1→2→2→1→1→2" },
        { ko: "관측선, 의료선, 차원 분광기는 밴 풀에서 제외", en: "Observer, Medivac and Warp Prism are not in the ban pool" },
        { ko: "미선택 유닛의 업그레이드는 그 유닛이 해당 플레이어에게 활성일 때만 허용", en: "Upgrades for an unpicked unit are allowed only while that unit is active for the player" },
        { ko: "Alt 키로 밴 정보 HUD와 생산 창을 함께 토글 (플레이어별 입력)", en: "Alt toggles the ban info HUD and production panel together (per player)" },
        { ko: "밴픽 종료 시 타이머를 0으로 초기화하고 타이머 트리거 비활성", en: "Timer resets to 0 and the timer trigger is disabled when the draft ends" },
        { ko: "로비 옵션 속성 101~108 8개를 모드가 직접 읽음", en: "The mod now reads lobby attributes 101 to 108 directly" },
      ] },
      { ko: "상태 표시", en: "Status indicators", items: [
        { ko: "이레디에이트: 유닛 윤곽에 빨간 후광과 본체 붉은 틴트 (기존 초록 구름은 유지)", en: "Irradiate: red halo around the unit and a red tint on the body (the stock green cloud stays)" },
        { ko: "파라사이트: 초록 구름(불투명도 0.5)과 빨간 후광, 붉은 틴트를 동시에 표시", en: "Parasite: green cloud (50% opacity) together with a red halo and red tint" },
        { ko: "효과가 끝나거나 대상이 죽거나 변태하면 표시가 즉시 사라짐", en: "Indicators disappear immediately when the effect ends or the target dies or morphs" },
      ] },
      { ko: "프로토스", en: "Protoss", items: [
        { ko: "직접적인 수치 조정은 없습니다. 공중 공방업과 생산 시설의 버튼 노출 문제만 수정했습니다.", en: "No direct number changes. Only air upgrade and production building button display bugs were fixed." },
      ] },
    ],
  },
  ...patchesOld.filter((p) => p.version === "v1.4.1").map((p) => ({ ...p, status: p.version === "v1.4.1" ? "previous" : "archive", titleKo: p.title, sumKo: p.summary })),
];
// English for v1.4.1 (the earliest version the site shows in full)
const en141 = {
  titleEn: "Convenience HUD and smart resource management",
  sumEn: "Production, research, upgrade and supply info now live on the match screen, with gas-worker auto-fill and a lobby convenience option.",
  changes: [
    "Separate army/worker supply, 12-slot production panel, 5 basic upgrade tracker",
    "Research overlay shows up to 4 projects with progress and done/cancelled state",
    "Auto-assign adjacent workers to gas from gas buildings or the main command card",
    "Lobby Convenience Mode ON/OFF option wired to map attribute 107",
    "Restored optimal mineral worker count and default game UI after match-start lock",
  ],
};
const p141 = patches.find((p) => p.version === "v1.4.1");
Object.assign(p141, { titleEn: en141.titleEn, sumEn: en141.sumEn });
p141.changes = p141.changes.map((c, i) => ({ ...c, en: en141.changes[i] }));

// News = JSON/MD later. Lab seeds it from real release records only (no invented announcements).
const news = [
  { slug: "v1-4-3", version: "v1.4.3", kind: "patch", date: null,
    ko: "v1.4.3 패치: 스네이크 밴과 전투 역할 재정립", en: "v1.4.3 patch: snake ban and combat role rework" },
  { slug: "v1-4-1", version: "v1.4.1", kind: "patch", date: "2026-09-14",
    ko: "v1.4.1 패치: 선택형 편의성 HUD 통합", en: "v1.4.1 patch: optional convenience HUD" },
];

// ---- Full roster from the base-game balance export (+ icon conversion, DDS -> PNG via ffmpeg) ----
const { execFileSync } = require("child_process");
fs.mkdirSync(path.join(__dirname, "..", "assets", "images", "icons", "base"), { recursive: true });
const base = require("./extract-base")();
const TEX = path.join(__dirname, "..", "..", "..", "base_balance_data_LOTV", "Assets", "Textures");
base.forEach((u) => {
  const out = path.join(__dirname, "..", "assets", "images", "icons", "base", u.id + ".png");
  const src = u.iconName && fs.readdirSync(TEX).find((f) => f.toLowerCase() === u.iconName.toLowerCase() + ".dds");
  if (src && !fs.existsSync(out)) { try { execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", path.join(TEX, src), "-vf", "scale=96:96", out]); } catch (e) {} }
  u.icon = fs.existsSync(out) ? "assets/images/icons/base/" + u.id + ".png" : null;
  delete u.iconName;
});
// documented v1.4.3 changes to base units (docs/v1.4.3 patch notes.md). Anything else needs the BPM mod XML export.
// extension unit -> the base unit it replaces in the hidden pick
const PAIR = { firebat: "Marauder", goliath: "Thor", warhound: "SiegeTank", wraith: "VikingFighter", science_vessel: "Raven", dragoon: "Stalker", energizer: "Sentry", corsair: "Phoenix", scout: "VoidRay", reaver: "Disruptor", arbiter: "Mothership", aberration: "Roach", ravasaur: "Ravager", defiler: "Infestor", queen: "Viper", tyrannozor: "Ultralisk", guardian: "BroodLord" };
unitsOut.forEach((u) => (u.pairId = PAIR[u.id]));

// ---- Mod XML: authoritative values for the current build, and the earlier build used as the "previous" column ----
const loadMod = require("./mod-data");
const MOD = { current: loadMod("current"), previous: loadMod("previous") };
const { resolveBase, resolveExt } = require("./resolve");
const EXT_MOD = { firebat: "Firebat", goliath: "Goliath", warhound: "WarHound", wraith: "Wraith", science_vessel: "ScienceVessel", dragoon: "Dragoon", energizer: "Energizer", corsair: "CorsairMP", scout: "ScoutMP", reaver: "Reaver", arbiter: "ArbiterMP", aberration: "InfestedAbomination", ravasaur: "Ravasaur", defiler: "DefilerMP", queen: "QueenClassic", tyrannozor: "Terrorzor", guardian: "GuardianMP" };
base.forEach((u) => { u.v = { "v1.4.3": resolveBase(u, MOD.current), "v1.4.1": resolveBase(u, MOD.previous) }; });
unitsOut.forEach((e) => { e.modId = EXT_MOD[e.id]; e.v = { "v1.4.3": resolveExt(e, e.modId, MOD.current), "v1.4.1": resolveExt(e, e.modId, MOD.previous) }; });

// Research times in the XML are game seconds (Normal speed). Players read Faster seconds, so divide by 1.4.
// Set RESEARCH_TIME_DIVISOR to 1 to show the XML numbers unchanged (the old patch notes quote XML numbers).
const RESEARCH_TIME_DIVISOR = 1.4;
const researchOf = (M, upgrade) => M.research.find((r) => r.upgrade === upgrade);
const p143 = patches.find((p) => p.version === "v1.4.3");
const fmtTime = (raw) => Math.round(raw / RESEARCH_TIME_DIVISOR);
const MODUP = { "분쇄탄": "BPM_MarauderShatterShells", "네이팜 탄창": "BPM_FirebatNapalmAmmo", "보병 중장갑": "BPM_TerranInfantryHeavyArmor", "크루시오 완충기": "BPM_CrucioSuppressor", "통합 화력 관제망": "BPM_RavenFireControlNetworkResearch", "과학선 부스트": "BPM_ScienceVesselBoostResearch", "원시 허물 진화": "BPM_TerrorzorCarapace" };
// drop what the shipped build does not contain (checked against the XML), then fill numbers from the XML
p143.upgrades = p143.upgrades.filter((u) => {
  if (u.ko === "요새화 프로토콜") { console.log("NOT IN BUILD: Fortification Protocol is absent from", MOD.current.source, "- removed from the v1.4.3 page"); return false; }
  return true;
});
p143.upgrades.forEach((u) => {
  const id = MODUP[u.ko];
  if (!id) return;
  const r = researchOf(MOD.current, id);
  if (!r) { console.log("MISSING research in XML:", u.ko, id); return; }
  u.cost = r.minerals + "/" + r.gas; u.time = fmtTime(r.time); u.rawTime = r.time; u.modId = id;
});
// numbers quoted in the diff rows that come from research entries
const wh = (M) => researchOf(M, "BPM_WarHoundTornadoMissile");
const whRow = p143.diffs.find((d) => d.unit === "WarHound" && d.en === "Haywire Missile research");
if (whRow && wh(MOD.previous) && wh(MOD.current)) {
  const f = (r) => r.minerals + "/" + r.gas + "/" + fmtTime(r.time) + "초";
  whRow.before = f(wh(MOD.previous)); whRow.after = f(wh(MOD.current));
}
p143.highlights[0] = { ko: "신규 연구 7종: 분쇄탄, 네이팜 탄창, 보병 중장갑, 크루시오 완충기, 통합 화력 관제망, 과학선 부스트, 원시 허물 진화", en: "Seven new researches: Shatter Shells, Napalm Canister, Infantry Heavy Armor, Crucio Suppressor, Integrated Fire Control Network, Science Vessel Boost, Primal Molt Evolution" };
p143.sumKo = p143.sumKo.replace("신규 연구 8종과 파라사이트가", "신규 연구 7종과 파라사이트가");
p143.sumEn = p143.sumEn.replace("Eight new researches", "Seven new researches");
p143.noteKo = "수치는 BPM_Core_v1.4.3_Fix1 모드 XML에서 추출한 값입니다. 연구 시간은 XML의 게임 초를 인게임 표시 시간(÷1.4)으로 환산했습니다.";
p143.noteEn = "Numbers are extracted from the BPM_Core_v1.4.3_Fix1 mod XML. Research times convert the XML game seconds to in-game Faster seconds (divide by 1.4).";

// ---- verify every claim the patch page makes against the XML ----
const C = MOD.current, P = MOD.previous;
const okList = [], badList = [];
const chk = (label, actual, expected) => (JSON.stringify(actual) === JSON.stringify(expected) ? okList : badList).push(label + " => " + JSON.stringify(actual) + (JSON.stringify(actual) === JSON.stringify(expected) ? "" : " (patch page says " + JSON.stringify(expected) + ")"));
const cu = (id) => (C.units[id] || { set: {}, attrs: {}, weapons: [] });
const blk = (id) => { const e = unitsOut.find((u) => u.id === id); return e ? e.v["v1.4.3"] : base.find((u) => u.id === id).v["v1.4.3"]; };
chk("Firebat hp", cu("Firebat").set.hp, 75); chk("Firebat Light", cu("Firebat").attrs.Light, true);
chk("Firebat hp (previous build)", (P.units.Firebat || { set: {} }).set.hp, 100);
chk("Marauder hp", blk("Marauder").hp, 100); chk("Marauder attrs", blk("Marauder").attrs.includes("Light") && !blk("Marauder").attrs.includes("Armored"), true);
chk("Goliath ground damage", C.effects.GoliathG && C.effects.GoliathG.amount, 21);
chk("Aberration hp / supply", [cu("InfestedAbomination").set.hp, cu("InfestedAbomination").set.supply], [200, 2]);
chk("Guardian hp / speed", [cu("GuardianMP").set.hp, cu("GuardianMP").set.speed], [200, 2.2]);
chk("Ravager hp / supply / cost", [cu("Ravager").set.hp, cu("Ravager").set.supply, cu("Ravager").set.minerals + "/" + cu("Ravager").set.gas], [150, 2, "50/50"]);
chk("Ravager morph seconds", Math.round((C.morph.MorphToRavager / 1.4) * 100) / 100, 8.57);
chk("Ravasaur attrs Light", cu("Ravasaur").attrs.Light, true);
chk("Ravasaur damage / bonus / range", [C.damageOf("BPM_RavasaurLaunchMissile") && C.damageOf("BPM_RavasaurLaunchMissile").amount, (C.damageOf("BPM_RavasaurLaunchMissile") || { bonus: [] }).bonus.map((b) => b.type + b.amount).join(), C.weapons.RavasaurWeapon.range], [10, "Armored10", 7]);
chk("Defiler cost / time", [cu("DefilerMP").set.minerals + "/" + cu("DefilerMP").set.gas, Math.round(C.train.find((t) => t.unit === "DefilerMP").time / 1.4)], ["50/200", 34]);
chk("Defiler weapon dmg / range / cd", (() => { const w = C.weapons.BPM_DefilerWeapon, d = C.damageOf(w.effect); return [d && d.amount, w.range, Math.round((w.period / 1.4) * 100) / 100]; })(), [5, 10, 1.07]);
chk("Viper weapon dmg / range", (() => { const w = C.weapons.BPM_ViperWeapon, d = C.damageOf(w.effect); return [d && d.amount, w.range]; })(), [1, 10]);
chk("Irradiate energy / range / duration(game s)", [C.abilities.Irradiate.energy, C.abilities.Irradiate.range, C.behaviors.Irradiate.duration], [75, 8, 21]);
chk("Defensive Matrix energy / range", [C.abilities.BPM_ScienceVesselDefensiveMatrix.energy, C.abilities.BPM_ScienceVesselDefensiveMatrix.range], [50, 10]);
chk("Science Vessel Boost duration / mult / cooldown", [C.behaviors.BPM_ScienceVesselBoost.duration, C.behaviors.BPM_ScienceVesselBoost.speedMult, C.abilities.BPM_ScienceVesselBoost.cooldown], [6, 2, 14]);
chk("Fire Control energy / range / mark seconds / damage x", [C.abilities.BPM_RavenFireControlNetwork.energy, C.abilities.BPM_RavenFireControlNetwork.range, C.behaviors.BPM_RavenFireControlMark.duration, C.behaviors.BPM_RavenFireControlMark.damageFraction], [50, 9, 1.25, 1.2]);
chk("Repair Drone energy / range", [C.abilities.BPM_RavenRepairDrone.energy, C.abilities.BPM_RavenRepairDrone.range], [50, 7]);
chk("Parasite energy / range", [C.abilities.BPM_QueenParasite.energy, C.abilities.BPM_QueenParasite.range], [75, 9]);
chk("Tyrannozor weapon dmg", (() => { const w = C.weapons.BPM_TerrorzorWeapon; return C.damageOf(w.effect) && C.damageOf(w.effect).amount; })(), 35);
chk("Napalm research", (() => { const r = researchOf(C, "BPM_FirebatNapalmAmmo"); return r.minerals + "/" + r.gas; })(), "100/100");
console.log("\nVERIFIED against " + C.source + ": " + okList.length + " ok, " + badList.length + " mismatched");
badList.forEach((b) => console.log("  MISMATCH", b));

const BPM = {
  base, modInfo: { current: MOD.current.source, previous: MOD.previous.source },
  meta: { current: "v1.4.3", unitCount: units.length, maps: maps.length, bans: "0·1·3·5" },
  units: unitsOut, overrides, versions, patches, news, glossary,
  maps: maps.map((m) => ({ id: m.id, ko: koName(m.name), en: enName(m.name), key: m.searchKeyword, terrainKo: m.terrain, featuresKo: m.features, terrainEn: ({
    washout: "Standard 2-player map with a narrow central path and a safe natural-to-third route.",
    fear_and_faith: "2-player map with wide outer routes and highland vision points around the third base.",
    rorschach: "2-player map built for aggressive tempo and early skirmishes.",
  })[m.id] })),
  tutorials,
  modifiedCount: modified.length,
  draftFlow: meta.draftFlow, convenience: meta.convenienceFeatures,
};
fs.mkdirSync(path.join(__dirname, "..", "assets", "js"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "..", "assets", "images", "icons", "base"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "..", "assets", "js", "data.js"), "window.BPM = " + JSON.stringify(BPM) + ";\n");
console.log("data.js written", Buffer.byteLength(JSON.stringify(BPM)), "bytes");
