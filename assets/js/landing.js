/* Landing: 3 variants. 1 = Console (HUD), 2 = Field Manual (index + search), 3 = Arena (broadcast stage) */
(function () {
  const { S, B, L, t, esc, ico, raceName, uname, upair, delta, store } = window.H;
  const cur = () => B.patches.find((p) => p.version === "v1.4.3");
  const headline = () => t("밴으로 흔들고,<br>히든 픽으로 완성하는 전장.", "Ban to shake it up.<br>Hidden-pick to finish it.");
  const sub = () => t("0·1·3·5밴 규칙과 비공개 선택으로 스타크래프트 II 1대1에 전략 한 층을 더하는 커스텀 모드입니다.", "A StarCraft II 1v1 custom mod that adds a ban phase and secret picks before the first worker moves.");
  const hl = (h) => t(h.ko, h.en);
  const newsKind = (k) => (k === "ptr" ? "PTR" : t("패치", "Patch"));
  const newsRows = (w, cls) => B.news.map((n) => `
    <a class="${cls}" href="patches.html#${n.version}">
      <span class="mono">${esc(n.version)}</span><span>${esc(t(n.ko, n.en))}</span><span class="mono mute">${esc(window.H.fmtDate(n.date))}</span>${ico("arrow-right")}
    </a>`).join("");
  const mapsEn = (m) => t(m.terrainKo, m.terrainEn);

  /* ============ 4. MIX (Console panels + Arena stage). No draft replay here; it lives in the guide. ============ */
  S.landing[4] = () => {
    const p = cur();
    const board = ["terran", "protoss", "zerg"].map((r) => `
      <div class="l4-row ${r}"><span class="l4-race">${raceName(r)}</span>
      <div class="l4-icons">${B.units.filter((u) => u.race === r).map((u) => `<a class="l4-u" href="wiki.html#${u.id}" title="${esc(uname(u))}"><img src="${u.icon}" alt="" width="44" height="44"><span>${esc(uname(u))}</span></a>`).join("")}</div></div>`).join("");
    const marquee = B.units.map((u) => `<span><img src="${u.icon}" alt="" width="28" height="28">${esc(uname(u))}</span>`).join("");
    const maps = B.maps.map((m, i) => `<article class="l3-map m${i}"><h3>${esc(t(m.ko, m.en))}</h3><p>${esc(mapsEn(m))}</p><span class="mono">${esc(m.key)}</span></article>`).join("");
    return {
      html: `
      <section class="l3-hero l4-hero">
        <div class="wrap l3-hero-in">
          <div class="l3-copy">
            <p class="l4-ver mono"><span class="pill">${esc(B.meta.current)}</span> ${t("현재 빌드", "Current build")}</p>
            <h1 class="l3-h1">${headline()}</h1>
            <p class="lede">${sub()}</p>
            <div class="l3-cta"><a class="btn btn-pri" href="guide.html">${t("가이드 시작", "Start the guide")}</a><a class="btn btn-sec" href="patches.html">${t("패치 노트", "Patch notes")}</a></div>
          </div>
          <div class="l4-board bracket" aria-label="${t("확장 유닛 17종", "17 extension units")}">
            <div class="l4-bhead"><span class="mono">ROSTER 17</span><a class="lnk" href="wiki.html">${t("전체 수치", "All stats")}${ico("arrow-right")}</a></div>
            ${board}
          </div>
        </div>
      </section>

      <section class="l3-phases wrap">
        <h2 class="vh">${t("드래프트 3단계", "Draft in three phases")}</h2>
        <div class="l3-ph ban"><h3>BAN</h3><p>${t("상대의 선택지를 지웁니다. 0·1·3·5밴, 스네이크 순서 지원.", "Strike options from your opponent. 0·1·3·5 bans, snake order supported.")}</p></div>
        <div class="l3-ph pick"><h3>HIDDEN PICK</h3><p>${t("살아남은 그룹에서 기본 유닛과 확장 유닛 중 하나를 숨긴 채 선택합니다.", "From each surviving group, secretly choose the base or the extension unit.")}</p></div>
        <div class="l3-ph go"><h3>DEPLOY</h3><p>${t("결과가 양측 테크트리에 적용되고, 카운트다운 뒤 경기가 시작됩니다.", "Results apply to both tech trees, then a countdown starts the match.")}</p></div>
        <a class="lnk l4-try" href="guide.html#draft">${t("직접 밴과 픽을 해 보기", "Try a ban and pick yourself")}${ico("arrow-right")}</a>
      </section>

      <div class="l3-marquee" aria-hidden="true"><div class="l3-track">${marquee}${marquee}</div></div>

      <section class="l4-patch wrap" id="updates">
        <div class="l4-pcard bracket">
          <div class="l4-phead"><span class="mono l4-pver">${esc(p.version)}</span><a class="lnk" href="patches.html">${t("전체 변경 보기", "See every change")}${ico("arrow-right")}</a></div>
          <h2>${esc(t(p.titleKo, p.titleEn))}</h2>
          <ul class="l4-hl">${p.highlights.map((h) => `<li>${ico("caret-right")}<span>${esc(hl(h))}</span></li>`).join("")}</ul>
        </div>
        <div class="l4-wiki">
          <h2 class="h2">${t("위키로 바로가기", "Jump into the wiki")}</h2>
          ${["terran", "protoss", "zerg"].map((r) => `<a class="l4-rl ${r}" href="wiki.html#${r}"><b>${raceName(r)}</b><span class="mono">${B.units.filter((u) => u.race === r).length} ${t("유닛", "units")}</span>${ico("arrow-up-right")}</a>`).join("")}
          <p class="mute">${t("모든 수치를 한 화면에서 보고, 직전 버전과 비교할 수 있습니다.", "See every number at once and compare with the previous version.")}</p>
        </div>
      </section>

      <section class="l3-maps wrap"><h2 class="h2">${t("전장", "Maps")}</h2><div class="l3-maprow">${maps}</div></section>
      <section class="l3-news wrap" id="news"><h2 class="h2">${t("뉴스", "News")}</h2>${newsRows("", "l3-nrow")}</section>`,
    };
  };
})();
