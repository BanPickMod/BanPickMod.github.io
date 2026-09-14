# BPM Web Showcase

StarCraft II 밴픽 모드(BPM)의 현재 기능, 밴픽 규칙, 확장 유닛, 편의성 HUD, 옵저버 모드와 지원 맵을 소개하는 정적 웹사이트입니다.

## 현재 기준

- Core: `v1.4.1` (`2026-09-14` 로컬 소스·배포 패키지 기준)
- Observer: `v1.0`
- 확장·대체 유닛: 17종
- 밴 규칙: 0 / 1 / 3 / 5
- 지원 전장: 3종

배틀넷 공개 상태는 이 저장소만으로 확정할 수 없으므로 게임 내에서 별도로 확인해야 합니다.

## 구성

- `index.html`: 시맨틱 페이지 구조, 내비게이션, 데이터 렌더링 대상
- `styles.css`: 반응형 레이아웃과 BPM UI 디자인 시스템
- `app.js`: JSON 로딩, 필터·검색, 유닛 상세, 가이드·패치 아코디언, 복사 기능
- `data/site_meta.json`: 현재 버전, 핵심 기능, 밴픽 흐름, 편의성 기능
- `data/units.json`: 17종 확장 유닛 상세 데이터
- `data/modified_units.json`: 기존 유닛 개편 데이터
- `data/system_diffs.json`: 시스템 전후 비교
- `data/tutorials.json`: 일반전·옵저버·밴픽·편의성 가이드
- `data/maps.json`: 지원 전장과 배틀넷 검색어
- `data/patches.json`: 버전별 변경 내역

## 로컬 실행

`fetch()`로 JSON 파일을 읽으므로 `index.html`을 직접 열지 말고 로컬 서버로 실행합니다.

```powershell
cd "D:\StarCraft II\Mods\BanPickMod2\ui-prototype\website"
python -m http.server 8085 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8085`에 접속합니다.

## 자산 정책

17종 유닛 아이콘은 SC2/BPM 원본 DDS 버튼 자산을 웹용 PNG로 변환해 사용합니다. 새 유닛 데이터에 아이콘이 누락될 경우에는 문자 모노그램으로 안전하게 대체하며, 존재하지 않는 영상이나 포스터 파일은 요청하지 않습니다.
