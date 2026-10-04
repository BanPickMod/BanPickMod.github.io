# BPM Web

StarCraft II 밴픽 모드(BPM)의 소개, 로비 가이드, 전체 유닛 밸런스 위키, 버전별 패치 내역을 보여주는 정적 웹사이트입니다. 다크 테마가 기본이며 라이트 테마와 한국어/English를 버튼으로 전환합니다.

## 페이지

- `index.html`: 랜딩과 뉴스 (뉴스는 `data.js`의 릴리스 기록에서 만듭니다)
- `guide.html`: 로비 세팅 위저드, 드래프트 체험(밴과 히든 픽 연습), 방 만들기·옵저버·편의성 절차, 옵션 요약표
- `wiki.html`: 기본 게임 유닛 57종과 BPM 추가 유닛 17종의 전체 수치 표/카드, BPM 추가 유닛과 대체되는 기본 유닛의 대응 비교
- `patches.html`: v1.4.3, v1.4.1 변경 내역 (유닛별 카드 또는 변경표)
- `patch-notes-v1.4.3.html`: 이전 디자인의 v1.4.3 상세 패치 노트 (`styles.css`, `patch-notes.css` 사용)

## 구성

- `assets/css/site.css`: 디자인 (Arena 무대 + Console 패널 + Field Manual 문서·표)
- `assets/js/site.js`: 공통 셸, 언어·테마 전환
- `assets/js/landing.js · guide.js · draft.js · wiki.js · wiki4.js · patches.js`: 페이지별 렌더링
- `assets/js/data.js`: 아래 도구가 생성하는 데이터 (직접 수정하지 않음)
- `tools/`: 위 데이터 파이프라인 (`extract-mod.py`, `mod-data.js`, `extract-base.js`, `resolve.js`, `build-data.js`). 기본 유닛 아이콘 변환에 ffmpeg가 필요합니다

## 데이터 출처

위키 수치는 모드 파일(`sc2-mod/*.SC2Mod`, MPQ 아카이브)의 `GameData` XML에서 직접 추출합니다.

1. `tools/extract-mod.py`가 현재 빌드(`BPM_Core_v1.4.3_Fix1`)와 이전 빌드(`BPM_Core_v1.4.2_Fix4`)의 XML과 문자열을 `tools/mod-extract/`로 풀어냅니다 (git 제외, `pip install mpyq` 필요).
2. `tools/mod-data.js`가 유닛, 무기, 효과, 연구, 생산, 변태, 능력, 행동 값을 읽습니다.
3. `tools/resolve.js`가 기본 게임 밸런스 XML(`base_balance_data_LOTV`, 기본 유닛)이나 수동 정리표(`data/units.json`, BPM 추가 유닛) 위에 모드 XML이 **명시한 값**을 덮어 버전별 값을 만듭니다.
4. `tools/build-data.js`가 `assets/js/data.js`를 만들고, 패치 페이지의 주장 23개를 XML과 대조해 결과를 출력합니다.

모드 XML은 캠페인과 의존성 데이터 위에 덮어쓰는 차분 형식입니다. 모드가 정하지 않은 값(일부 BPM 유닛의 보호막, 방어력, 시야, 속성, 일부 무기 쿨다운)은 XML에 없습니다. 이런 값은 위키에서 **점선 밑줄**로 표시하고, 상세 패널의 "값의 출처"에 따로 적습니다. 이전 빌드 열은 `v1.4.2_Fix4`에서 뽑은 값이라 v1.4.1과 완전히 같지 않을 수 있습니다.

연구 시간은 XML의 게임 초를 인게임 표시 시간(÷1.4)으로 환산합니다. XML 값을 그대로 보이려면 `tools/build-data.js`의 `RESEARCH_TIME_DIVISOR`를 1로 바꿉니다.

v1.4.3의 날짜는 문서에 없어 "날짜 미정"으로 표시됩니다.

## 데이터 다시 만들기

```powershell
cd "D:\StarCraft II\Mods\BanPickMod2\ui-prototype\website"
python tools/extract-mod.py
node tools/build-data.js
```

## 로컬 실행

```powershell
cd "D:\StarCraft II\Mods\BanPickMod2\ui-prototype\website"
python -m http.server 8085 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8085`에 접속합니다. 폰트와 아이콘을 CDN에서 불러오므로 인터넷 연결이 필요합니다.

## 자산 정책

유닛·업그레이드 아이콘은 SC2/BPM 원본 DDS 버튼 자산을 웹용 PNG로 변환해 사용합니다. 공개 배포 전에 자산 사용 조건을 확인해야 합니다.
