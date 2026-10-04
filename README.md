# BPM Web

StarCraft II 밴픽 모드(BPM)의 소개, 로비 가이드, 전체 유닛 밸런스 위키, 버전별 패치 내역을 보여주는 정적 웹사이트입니다. 다크 테마가 기본이며 라이트 테마와 한국어/English를 버튼으로 전환합니다.

## 페이지

- `index.html`: 랜딩과 뉴스 (뉴스는 `data.js`의 릴리스 기록에서 만듭니다)
- `guide.html`: 로비 세팅 위저드, 드래프트 체험(밴과 히든 픽 연습), 방 만들기·옵저버·편의성 절차, 옵션 요약표
- `wiki.html`: 기본 게임 유닛 57종과 BPM 추가 유닛 17종의 전체 수치 표/카드, BPM 추가 유닛과 대체되는 기본 유닛의 대응 비교
- `patches.html`: v1.5 PTR, v1.4.3, v1.4.1 변경 내역 (유닛별 카드 또는 변경표)
- `patch-notes-v1.4.3.html`: 이전 디자인의 v1.4.3 상세 패치 노트 (`styles.css`, `patch-notes.css` 사용)

## 구성

- `assets/css/site.css`: 디자인 (Arena 무대 + Console 패널 + Field Manual 문서·표)
- `assets/js/site.js`: 공통 셸, 언어·테마 전환
- `assets/js/landing.js · guide.js · draft.js · wiki.js · wiki4.js · patches.js`: 페이지별 렌더링
- `assets/js/data.js`: 아래 도구가 생성하는 데이터 (직접 수정하지 않음)
- `tools/build-data.js`, `tools/extract-base.js`: `data/*.json`과 저장소 루트의 `base_balance_data_LOTV/*.xml`을 합쳐 `data.js`와 기본 유닛 아이콘을 만듭니다 (ffmpeg 필요)

## 데이터 출처와 한계

- 기본 게임 유닛 수치는 기본 게임 밸런스 XML입니다. BPM이 바꾼 값은 문서에 기록된 항목(예: 불곰 체력)만 반영되어 있고, 모드 XML을 같은 형식으로 추가하면 덮어쓸 수 있습니다.
- 능력(Abilities)의 피해량·사거리는 기본 XML에 대부분 없어서 일부만 표시됩니다.
- v1.4.3, v1.5의 날짜는 문서에 없어 "날짜 미정"으로 표시됩니다.

## 데이터 다시 만들기

```powershell
cd "D:\StarCraft II\Mods\BanPickMod2\ui-prototype\website"
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
