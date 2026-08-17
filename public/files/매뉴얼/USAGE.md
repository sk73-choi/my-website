# MAME 롬 선별 도구 — 사용 설명서

입력한 게임 제목 목록에 매칭되는 **모든 변형(버전/클론) 롬**을 두 소스 폴더에서 찾아,
소스별 결과 폴더로 복사해 주는 도구입니다.

---

## 0. 준비물 요약

| 항목 | 설명 | 준비 주체 |
|---|---|---|
| Python 3.9+ | 실행 환경 (Windows는 `py` 런처) | 사용자 |
| `metadata/mame_list_YYMMDD.txt` | 원하는 게임 제목 목록 | **사용자가 직접 작성** |
| `reference_dats/` | MAME listxml 출력 또는 공식 DAT(XML) | **사용자가 직접 준비** |
| `roms_attractmode/`, `roms_retrobat/` | 원본 롬 zip 폴더 (읽기 전용) | 이미 존재 |
| `aliases.json` | 한글→영문 별칭 매핑 | 제공됨 (필요 시 보완) |

> ⚠️ 소스 폴더(`roms_attractmode/`, `roms_retrobat/`)의 파일은 **어떤 경우에도 삭제·수정되지 않습니다.** 오직 읽어서 복사만 합니다.

> 📌 **현재 실제 상태 (2026-08 기준)**: `main.py`의 `ROM_SOURCES`는 위 두 폴더가 아니라
> 프로젝트 폴더 안의 `"MAME 0.288 ROMs (non-merged)"` 폴더 하나만 가리키도록 정리되어 있습니다
> (과거 2-소스 구조에서 축소됨). 그리고 AttractMode/RetroBat이 실제로 재생에 쓰는 "진짜" 공용
> 롬 폴더는 이 프로젝트 폴더가 아니라 **`E:\games\roms_288`** 입니다 — 이 폴더 자체와
> 여기서 파생되는 `게임명.txt` / `snaps_288` 스냅샷 작업에 대해서는 11장을 보세요.

---

## 1. 폴더 구조

실행 전 프로젝트 폴더는 다음과 같아야 합니다.

```
mame_file_extractor/
├── main.py                     # 실행 진입점
├── game_name_matcher.py        # 게임명 매칭
├── rom_file_locator.py         # 롬 zip 검색
├── output_organizer.py         # 결과 폴더 생성/청소/복사
├── report_generator.py         # 리포트 생성
├── aliases.json                # 한글 별칭 매핑
│
├── metadata/
│   └── mame_list_YYMMDD.txt     # ← 사용자가 작성 (게임 목록)
├── reference_dats/
│   └── (예: mame0260.dat 또는 mame_full.xml)   # ← 사용자가 준비
├── roms_attractmode/            # 원본 롬 (읽기 전용)
│   └── *.zip
└── roms_retrobat/               # 원본 롬 (읽기 전용)
    └── *.zip
```

실행 후에는 아래가 자동 생성됩니다.

```
├── .cache/gamedb.json                       # 파싱 캐시(자동)
├── selected_roms_attractmode_YYMMDD/        # 결과 폴더 (복사된 zip)
├── selected_roms_retrobat_YYMMDD/           # 결과 폴더 (복사된 zip)
├── match_report_attractmode_YYMMDD.txt      # 리포트
└── match_report_retrobat_YYMMDD.txt         # 리포트
```

---

## 2. 1단계 — 참조 데이터 준비 (최초 1회)

게임 제목을 롬 파일명으로 바꾸려면 MAME 게임 DB가 필요합니다. 아래 중 **하나**를
`reference_dats/` 폴더에 넣어 두세요. (형식은 둘 다 XML로 동일하게 취급됩니다.)

**방법 A — 로컬에 MAME 실행파일이 있는 경우**
```bash
mame -listxml > reference_dats/mame_full.xml
```
> 이 명령은 수십 초~수 분 걸리고 출력이 수백 MB이지만, MAME 버전을 바꾸지 않는 한
> **다시 할 필요 없는 1회성 작업**입니다.

**방법 B — MAME 실행파일이 없는 경우**
- MAME 공식 배포 DAT/XML(예: progettosnaps.net의 "Complete DAT")을 내려받아
  `reference_dats/` 폴더에 저장합니다. 예: `reference_dats/mame0260.dat`

> 파일이 여러 개 있어도 됩니다. `.xml`, `.dat` 확장자를 모두 읽어 합칩니다.

---

## 3. 2단계 — 게임 목록 파일 작성

`metadata/` 폴더에 `mame_list_YYMMDD.txt` 파일을 만들고, **한 줄에 게임 제목 하나**씩 적습니다.
파일명의 `YYMMDD`는 아무 날짜나 가능하며, 여러 개 있으면 **가장 최신 파일**이 자동 선택됩니다.

예시 — `metadata/mame_list_260712.txt`:
```
메탈 슬러그
스트리트 파이터
버블보블
Pac-Man
# 이 줄은 주석 (무시됨)
```

작성 팁:
- 한글/영문 모두 가능합니다.
- **버전·번호 없는 통칭**을 쓰면 그 시리즈의 모든 버전이 포함됩니다.
  - "메탈 슬러그" → Metal Slug, 2, 3, X, 4, 5, 6 및 지역/버전 클론 전부
  - "스트리트 파이터" → Street Fighter, II, Alpha 등 "street fighter"가 들어간 모든 롬
- 빈 줄과 `#`로 시작하는 줄은 무시됩니다.
- 한글 제목은 `aliases.json`에 등록돼 있어야 잘 매칭됩니다(4단계 참고).

---

## 4. 3단계 — (선택) 한글 별칭 보완

한글 제목은 영문 MAME 설명과 직접 매칭되지 않으므로 `aliases.json`에서 영문 통칭으로
변환합니다. 기본 제공되는 예시:

```json
{
  "스트리트파이터": "Street Fighter",
  "메탈슬러그": "Metal Slug",
  "버블보블": "Bubble Bobble",
  "철권": "Tekken",
  "킹오브파이터": "The King of Fighters"
}
```

규칙:
- **키(왼쪽)**: 한글 제목. 조회 시 **띄어쓰기는 무시**되므로 "메탈 슬러그"/"메탈슬러그" 모두 매칭됩니다.
- **값(오른쪽)**: 영문 통칭. 모든 버전을 포함하려면 **번호/버전 없이** 적으세요(예: `"Street Fighter"`).
- 매칭 실패한 한글 제목이 있으면 여기에 항목을 추가한 뒤 다시 실행하면 됩니다.

---

## 5. 4단계 — 실행

프로젝트 폴더에서 다음을 실행합니다. (Windows는 `py`, 그 외는 `python3`)

```bash
py main.py
```

기본 동작:
1. `metadata/mame_list_*.txt` 중 최신 파일을 읽음
2. `reference_dats/`로 게임 DB 로드 (`.cache/gamedb.json`에 캐싱 → 다음 실행부터 빠름)
3. 각 제목에 매칭되는 **모든 변형 롬** 수집
4. 소스 폴더(`roms_attractmode/`, `roms_retrobat/`)별로:
   - 결과 폴더의 **기존 zip을 모두 삭제(청소)** 후
   - 매칭된 롬 중 그 소스에 있는 zip을 복사
5. 소스별 리포트 생성

실행 화면 예:
```
[게임 목록] metadata\mame_list_260712.txt
[게임 수] 4
[게임 DB] 45000 항목 로드
[매칭] 매칭된 제목 3/4 | 매칭된 변형(롬) 총 12개
[attractmode] 청소 0 zip 삭제 -> 복사 12개 -> selected_roms_attractmode_260712/  | 리포트: match_report_attractmode_260712.txt
[retrobat] 청소 0 zip 삭제 -> 복사 5개 -> selected_roms_retrobat_260712/  | 리포트: match_report_retrobat_260712.txt
```

---

## 6. 실행 옵션 (선택)

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--games <경로>` | `metadata/`의 최신 `mame_list_*.txt` | 게임 목록 파일을 직접 지정 |
| `--ref-dats <폴더>` | `reference_dats` | 참조 DAT/XML 폴더 |
| `--date <YYMMDD>` | 오늘 날짜 | 결과 폴더/리포트에 붙일 날짜 |
| `--sources <라벨,라벨>` | `attractmode,retrobat` | 처리할 소스만 선택 |

예시:
```bash
# 특정 목록 파일과 날짜로 실행
py main.py --games metadata/mame_list_260712.txt --date 260712

# attractmode 소스만 처리
py main.py --sources attractmode
```

---

## 7. 5단계 — 결과 확인

### 결과 폴더
- `selected_roms_attractmode_YYMMDD/` — attractmode 소스에서 복사된 zip
- `selected_roms_retrobat_YYMMDD/` — retrobat 소스에서 복사된 zip

### 리포트 파일 (`match_report_{소스}_YYMMDD.txt`)
맨 위에 **제목별 롬 파일 목록**이 나옵니다.
```
■ 제목별 롬 파일 목록 (제목 : rom1.zip, rom2.zip, ...)
  메탈 슬러그 : mslug.zip, mslug2.zip, mslug3.zip, ...
  스트리트 파이터 : sf.zip, sf2.zip, sfa.zip, ...
  Pac-Man : pacman.zip
  없는게임xyz : (매칭 실패)
```
그 아래 상세 섹션에서 각 제목의 매칭된 변형과 `[복사]`/`[없음]` 여부, 매칭 실패 제목의
근접 후보까지 확인할 수 있습니다.

표기 의미:
- `[복사]` — 그 소스에 있어 복사됨
- `[없음]` — 매칭됐지만 그 소스 폴더에 zip이 없음(다른 소스엔 있을 수 있음)
- `(매칭 실패)` — DB에서 제목을 못 찾음 → `aliases.json` 보완 또는 제목 표기 수정 권장

---

## 8. 반복 실행 / 재실행

- **실행할 때마다** 결과 폴더의 기존 `*.zip`을 모두 지우고 새로 채웁니다.
  (이전 실행 잔여물이 섞이지 않음)
- 목록을 바꿔 다시 돌리면 그날 폴더가 새 내용으로 갱신됩니다.
- 소스 폴더는 절대 변경되지 않으니 안심하고 반복 실행해도 됩니다.

---

## 9. 자주 겪는 상황 (FAQ)

**Q. 한글 제목이 "매칭 실패"로 나와요.**
→ `aliases.json`에 `"한글제목": "English Title"`을 추가하고 다시 실행하세요.
값은 번호 없는 통칭으로 적어야 모든 버전이 잡힙니다.

**Q. 너무 많은 롬이 잡혀요.**
→ 넓은 매칭이라 단어 하나만 넣으면 많이 걸립니다. 제목을 더 구체적으로
(예: "스트리트 파이터 2") 쓰거나, 목록에서 원하는 표기로 좁히세요.

**Q. 결과 폴더에 아무것도 안 들어왔어요.**
→ 매칭은 됐지만 그 소스 폴더에 해당 zip이 없을 수 있습니다. 리포트의
`[없음]` 항목과 다른 소스 리포트를 확인하세요.

**Q. 매칭 정확도를 더 높이고 싶어요.**
→ `pip install rapidfuzz` 후 실행하면 폴백 퍼지 매칭 품질이 좋아집니다.
(설치 안 돼 있으면 표준 `difflib`로 동작합니다.)

**Q. MAME를 업데이트했어요.**
→ `reference_dats/`의 DAT/XML을 새 버전으로 교체하세요. 캐시는 원본이 더 새로우면
자동으로 다시 파싱됩니다. (강제로 지우려면 `.cache/gamedb.json` 삭제)

---

## 10. 전체 흐름 한눈에

```
① reference_dats/ 에 MAME DAT/XML 준비  (최초 1회)
② metadata/mame_list_YYMMDD.txt 에 게임 목록 작성
③ (한글이면) aliases.json 에 별칭 추가
④ py main.py 실행
⑤ selected_roms_*_YYMMDD/ 폴더와 match_report_*_YYMMDD.txt 확인
```

---

## 11. 게임명.txt / 스냅샷(snaps_288) 관리 (E:\games 기준, 2026-08 추가)

이 장은 `main.py` 파이프라인과는 별개로, **`E:\games\roms_288`(AttractMode/RetroBat이 실제로
쓰는 공용 롬 폴더)를 기준으로 게임 목록 텍스트와 인게임 스크린샷을 관리하는 작업**을 다룹니다.
관련 스크립트는 전부 이 프로젝트 폴더에 있고, 항상 이 프로젝트 폴더에서 실행합니다.

### 11.1 결과물

| 경로 | 내용 |
|---|---|
| `E:\games\게임명.txt` | `roms_288`에 있는 게임들을 `영어게임명(한글게임명)` 한 줄씩으로 정리한 목록 (클론/버전은 게임당 1줄로 통합) |
| `E:\games\snaps_288\*.png` | 위 목록과 1:1 대응하는 인게임 스크린샷. 파일명이 곧 `게임명.txt`의 그 줄 텍스트 |

### 11.2 스크립트

| 스크립트 | 역할 |
|---|---|
| `build_gamelist.py` | `roms_288`의 zip들을 DAT로 조회 → 게임당 대표 1개로 중복 제거 → Google 번역(비공식, 인터넷 필요)으로 한글 병기 → `게임명.txt` 생성. 번역 결과는 `.cache/ko_translate_cache.json`에 캐싱되어 재실행 시 그대로 재사용됨 |
| `collect_snaps.py [--online]` | `게임명.txt` 각 줄에 대해 스냅샷을 찾아 `snaps_288`에 저장. 우선순위: `attractmode/scraper/mame_240/snap` → `mame_106/snap` → 옛 `mame32 Plus Plus/snap` → (`--online` 지정 시) `adb.arcadeitalia.net`에서 온라인으로 받아옴 |
| `fix_temp_snaps.py` | 수집된 스냅샷 중, DAT상 화면이 없는 기계식/슬롯머신/디바이스 롬(`ismechanical`/`isdevice`/`isbios`)이 같은 이름 때문에 진짜 비디오 게임 대신 잘못 골라져 "Screenless System" 같은 플레이스홀더 이미지가 저장된 경우를 찾아, 진짜 비디오 게임판으로 재매칭해서 다시 수집 |
| `substitute_temp_snaps.py` | `fix_temp_snaps.py`로도 못 고치는(=이 romset에 진짜 비디오게임판이 아예 없는) 항목을, 폴더 안에 이미 있는 같은 프랜차이즈의 진짜 게임 스냅샷으로 대체. 스크립트 안 `SUBSTITUTIONS` 딕셔너리를 그때그때 상황에 맞게 고쳐서 쓰는 수동 매핑 도구 |
| `sort_flagged_snaps.py` | `snaps_288`에서 파일명 맨 앞에 사람이 손으로 붙여둔 표시(`-`, `X_`)를 처리. `-`(깨짐/이상함) → 접두사를 뗀 원래 이름으로 `snaps_288\temp`로 이동(재검토용). `X_`(게임 자체가 불필요) → 그 게임의 rom(zip, `roms_288`)과 snap을 둘 다 `snaps_288\temp2`로 이동(삭제 검토용) |
| `update_gamelist_from_snaps.py` | `snaps_288`에 실제로 남아있는 파일 목록을 기준으로 `게임명.txt`를 다시 씀. `temp`/`temp2`에서 검토·삭제를 끝낸 뒤 마지막에 실행해서 목록을 최종 확정 상태와 맞출 때 씀 |

### 11.3 작업 순서

```
① py build_gamelist.py           게임명.txt 생성
② py collect_snaps.py --online   snaps_288 채우기
③ (육안 검토) 이상한 파일 앞에 -, 불필요한 게임 앞에 X_ 를 파일명에 직접 붙인다
④ py sort_flagged_snaps.py       표시한 파일들을 temp/temp2로 분류
⑤ py fix_temp_snaps.py           temp 중 "기계식 오매칭" 문제 자동 재수집
⑥ (남은 temp가 있으면) substitute_temp_snaps.py의 SUBSTITUTIONS를 채워서 실행
⑦ temp2에 모인 rom+snap 쌍을 확인 후 직접 삭제 (X_ 표시했던 진짜 불필요 게임들)
⑧ py update_gamelist_from_snaps.py   최종 snaps_288 기준으로 게임명.txt 재생성
⑨ 아래 11.4에 따라 AttractMode / RetroBat 갱신
```

### 11.4 `roms_288` 변경 후 AttractMode / RetroBat 갱신 (매번 필요!)

`roms_288`의 zip이 추가/삭제될 때마다, 두 프로그램 모두 자기 내부 게임 목록을 다시 스캔해야
실제 화면에 반영됩니다. 안 하면 지운 게임이 계속 뜨거나(실행 시 "파일 없음" 에러), 새로 넣은
게임이 안 보입니다.

**AttractMode**

```
cd E:\games\attractmode
attract-console.exe --build-romlist mame_288 -o mame_288
```

- `-o mame_288` 을 **꼭 붙이세요.** 안 붙이면 간헐적으로 `mame_288.txt`가 아니라
  `mame_2881.txt`처럼 엉뚱한 파일명으로 저장되는 현상이 있었습니다(원인 불명 — attract-console
  자체 버그로 추정). `-o`로 출력 파일명을 명시하면 확실하게 `romlists\mame_288.txt`에 덮어써집니다.
- 완료되면 인터페이스 전용 더미롬(예: MCU 덤프)은 "Discarded N entries" 로그와 함께 자동으로
  목록에서 제외됩니다. 정상입니다.

**RetroBat**

- **방법 1 (빠름, 추천)**: `E:\games\RetroBat\RetroBat.exe` 실행 → MAME/아케이드 시스템 화면에서
  키보드 **F5** → EmulationStation이 롬 폴더를 다시 스캔해서 추가/삭제된 항목만 반영합니다.
  기존에 스크래핑해둔 정보(설명, 아트워크 등)는 유지됩니다.
- **방법 2 (완전 재구성)**: `E:\games\roms_288\gamelist.xml`을 삭제하거나 다른 이름으로 백업한 뒤
  RetroBat을 실행하면 그 시스템의 목록이 롬 폴더 기준으로 완전히 새로 만들어집니다. 이 경우 기존
  스크래핑 정보는 사라지므로, 새로 스크래핑해야 할 수 있습니다.
- `E:\games\RetroBat\BatGui.exe`에서 시스템별 롬 경로 등 설정을 확인/수정할 수 있습니다.

### 11.5 다른 PC로 옮겼을 때 주의사항

- 5장(`relocate_games.py`)은 **AttractMode/RetroBat 설정 파일 안의 경로**만 새 드라이브 문자로
  고쳐줍니다. 11장의 스크립트들(`build_gamelist.py`, `collect_snaps.py` 등)은 대상이 아니므로,
  드라이브 문자가 바뀌면 각 스크립트 상단의 `ROMS_DIR` / `SNAPS_DIR` / `GAMELIST_PATH` 같은 경로
  상수를 새 드라이브 문자로 **직접 고쳐야** 합니다.
- `collect_snaps.py --online`과 `build_gamelist.py`의 번역 기능은 인터넷 연결이 필요합니다.
