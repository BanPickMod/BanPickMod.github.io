const fs = require("fs");
let r = fs.readFileSync("README.md", "utf8");
const a = r.indexOf("## 데이터 출처와 한계"), b = r.indexOf("## 로컬 실행");
r = r.slice(0, a) + `## 데이터 출처

위키 수치는 모드 파일(\`sc2-mod/*.SC2Mod\`, MPQ 아카이브)의 \`GameData\` XML에서 직접 추출합니다.

1. \`tools/extract-mod.py\`가 현재 빌드(\`BPM_Core_v1.4.3_Fix1\`)와 이전 빌드(\`BPM_Core_v1.4.2_Fix4\`)의 XML·문자열을 \`tools/mod-extract/\`로 풀어냅니다 (git 제외, \`pip install mpyq\` 필요).
2. \`tools/mod-data.js\`가 유닛·무기·효과·연구·생산·변태·능력·행동 값을 읽습니다.
3. \`tools/resolve.js\`가 기본 게임 밸런스 XML(\`base_balance_data_LOTV\`, 기본 유닛)이나 수동 정리표(\`data/units.json\`, BPM 추가 유닛) 위에 모드 XML의 **명시된 값**을 덮어 버전별 값을 만듭니다.
4. \`tools/build-data.js\`가 \`assets/js/data.js\`를 만들고, 패치 페이지의 주장 23개를 XML과 대조해 결과를 출력합니다.

모드 XML은 캠페인/의존성 데이터 위에 덮어쓰는 차분 형식이라 모드가 정하지 않은 값(예: 파이어뱃 이외 일부 BPM 유닛의 보호막·방어력·시야·속성, 일부 무기 쿨다운)은 XML에 없습니다. 이런 값은 위키에서 **점선 밑줄**로 표시하고 상세 패널의 "값의 출처"에 따로 적습니다. 이전 빌드 열은 \`v1.4.2_Fix4\`에서 뽑은 값이며 v1.4.1과 완전히 같지 않을 수 있습니다.

연구 시간은 XML의 게임 초를 인게임 표시 시간(÷1.4)으로 환산합니다. XML 값을 그대로 보이려면 \`tools/build-data.js\`의 \`RESEARCH_TIME_DIVISOR\`를 1로 바꿉니다.

v1.4.3, v1.5의 날짜는 문서에 없어 "날짜 미정"으로 표시됩니다.

## 데이터 다시 만들기

\`\`\`powershell
cd "D:\StarCraft II\Mods\BanPickMod2\ui-prototype\website"
python tools/extract-mod.py
node tools/build-data.js
\`\`\`

` + r.slice(b);
r = r.replace("- `tools/build-data.js`, `tools/extract-base.js`: `data/*.json`과 저장소 루트의 `base_balance_data_LOTV/*.xml`을 합쳐 `data.js`와 기본 유닛 아이콘을 만듭니다 (ffmpeg 필요)", "- `tools/`: 위 데이터 파이프라인 (`extract-mod.py`, `mod-data.js`, `extract-base.js`, `resolve.js`, `build-data.js`). 기본 유닛 아이콘 변환에 ffmpeg가 필요합니다");
fs.writeFileSync("README.md", r);
console.log(r.includes("RESEARCH_TIME_DIVISOR"), r.includes("tools/"));
