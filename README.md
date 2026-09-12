# BPM Official Web Showcase (Prototype)

스타크래프트 2 밴픽 모드(BanPickMod2, BPM) 공식 웹 쇼케이스 및 데이터베이스 프로토타입입니다.

## 1. 구성 파일

* `index.html`: 메인 웹페이지 구조 (시맨틱 HTML5, 반응형 그리드)
* `styles.css`: SC2 사이버네틱 다크 테마 (글래스모피즘, 종족별 테마 컬러 및 발광 효과)
* `app.js`: 데이터 페칭, 종족별 필터, 실시간 검색, 영상/시뮬레이션 모달, 맵 검색어 복사
* `data/`
  * `units.json`: 17종 신규/확장 유닛 기본 스펙, 대체 페어 비교(Diff), 전용 업그레이드 수치
  * `system_diffs.json`: 해방선 시야 통일, 지원유닛 1뎀 평타, 대군주 자동 미네랄 랠리 등
  * `maps.json`: 정식 지원 전장 3종 (Washout, Fear and Faith, Rorschach)
  * `patches.json`: 버전별(v1.4, v1.3, v1.2) 체인지로그 및 카테고리 태그
  * `tutorials.json`: 방 생성 및 밴픽 단계별 가이드

## 2. 로컬 실행 방법

별도의 빌드 도구나 Node.js 설치 없이 로컬 웹 서버로 바로 구동됩니다.

```bash
cd "d:\StarCraft II\Mods\BanPickMod2\ui-prototype\website"
python -m http.server 8085
```

브라우저에서 `http://localhost:8085` 접속.

## 3. GitHub Pages 배포 안내

이 폴더의 파일들을 GitHub Pages 배포 브랜치(`gh-pages`)의 루트 경로 또는 리포지토리 설정의 소스 디렉터리로 지정하면 즉시 무료로 서비스됩니다.
신규 유닛 스킬 클립 영상(`.mp4`, `.webm`)은 `assets/videos/` 경로에 배치하면 웹페이지에서 자동 로드됩니다.
