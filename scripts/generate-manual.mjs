// 관리자 매뉴얼(docx) 생성기.
// docs/screenshots/{key}.png 가 있으면 해당 위치에 자동 삽입, 없으면 자리표시 박스.
// 실행: node scripts/generate-manual.mjs  → docs/관리자_매뉴얼.docx
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  PageBreak,
} from 'docx'

const FONT = 'Malgun Gothic'
const ACCENT = '4F46E5'
const SHOT_DIR = 'docs/screenshots'

// ── 블록 헬퍼 ───────────────────────────────
const H1 = (t) => ({ t: 'h1', x: t })
const H2 = (t) => ({ t: 'h2', x: t })
const H3 = (t) => ({ t: 'h3', x: t })
const P = (t) => ({ t: 'p', x: t })
const UL = (items) => ({ t: 'ul', x: items })
const OL = (items) => ({ t: 'ol', x: items })
const NOTE = (t) => ({ t: 'note', x: t })
const TABLE = (headers, rows) => ({ t: 'table', headers, rows })
const SHOT = (key, caption) => ({ t: 'shot', key, caption })
const PB = () => ({ t: 'pb' })

// ── 렌더러 ─────────────────────────────────
function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, ...(opts.spacing || {}) },
    alignment: opts.alignment,
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })],
  })
}

// PNG 헤더에서 크기 읽기(비율 유지용)
function pngSize(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  }
  return null
}

function shotBlock(key, caption) {
  const file = join(SHOT_DIR, `${key}.png`)
  if (existsSync(file)) {
    const buf = readFileSync(file)
    const size = pngSize(buf)
    const maxW = 560
    const width = size ? Math.min(maxW, size.w) : maxW
    const height = size ? Math.round((width * size.h) / size.w) : 360
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 60 },
        children: [new ImageRun({ data: buf, transformation: { width, height } })],
      }),
      para(`▲ ${caption}`, { italics: true, color: '666666', size: 18, alignment: AlignmentType.CENTER }),
    ]
  }
  // 자리표시 박스
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: boxBorders('BBBBBB'),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F3F4F6' },
              margins: { top: 200, bottom: 200, left: 120, right: 120 },
              children: [
                para(`[ 스크린샷 자리 ]  ${caption}`, { bold: true, color: '888888', alignment: AlignmentType.CENTER }),
                para(`docs/screenshots/${key}.png 를 넣고 매뉴얼을 다시 생성하면 이 위치에 삽입됩니다.`, {
                  italics: true,
                  color: '999999',
                  size: 16,
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    para(''),
  ]
}

function boxBorders(color) {
  const b = { style: BorderStyle.SINGLE, size: 6, color }
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }
}

function tableBlock(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          shading: { fill: ACCENT },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [para(h, { bold: true, color: 'FFFFFF', size: 18 })],
        }),
    ),
  })
  const bodyRows = rows.map(
    (r, i) =>
      new TableRow({
        children: r.map(
          (c) =>
            new TableCell({
              shading: { fill: i % 2 ? 'F7F7FB' : 'FFFFFF' },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [para(String(c), { size: 18 })],
            }),
        ),
      }),
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: boxBorders('DDDDDD'),
    rows: [headerRow, ...bodyRows],
  })
}

function render(blocks) {
  const out = []
  for (const b of blocks) {
    switch (b.t) {
      case 'h1':
        out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: b.x, bold: true, color: ACCENT })] }))
        break
      case 'h2':
        out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: b.x, bold: true })] }))
        break
      case 'h3':
        out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 }, children: [new TextRun({ text: b.x, bold: true, color: '333333' })] }))
        break
      case 'p':
        out.push(para(b.x))
        break
      case 'ul':
        b.x.forEach((it) => out.push(new Paragraph({ text: it, bullet: { level: 0 }, spacing: { after: 60 } })))
        break
      case 'ol':
        b.x.forEach((it, i) => out.push(para(`${i + 1}. ${it}`, { spacing: { after: 60 } })))
        break
      case 'note':
        out.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: boxBorders('FBBF24'),
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'FFFBEB' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [para(`💡 ${b.x}`, { size: 18, color: '92400E' })],
                  }),
                ],
              }),
            ],
          }),
        )
        out.push(para(''))
        break
      case 'table':
        out.push(tableBlock(b.headers, b.rows))
        out.push(para(''))
        break
      case 'shot':
        shotBlock(b.key, b.caption).forEach((p) => out.push(p))
        break
      case 'pb':
        out.push(new Paragraph({ children: [new PageBreak()] }))
        break
      default:
        break
    }
  }
  return out
}

// ── 매뉴얼 내용 ─────────────────────────────
const content = []

// 표지
content.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: 'SK Choi 개인 웹사이트', bold: true, size: 56, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: '관리자 시스템 사용 매뉴얼', bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'https://sk73-choi.github.io/my-website/', size: 22, color: '4F46E5' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `생성일: ${new Date().toISOString().slice(0, 10)}`, size: 20, color: '888888' })] }),
  new Paragraph({ children: [new PageBreak()] }),
)

// 본문 블록
const body = [
  H1('1. 이 사이트는 어떻게 동작하나요? (꼭 읽어주세요)'),
  P('이 웹사이트는 "정적 사이트(static site)"입니다. 즉, 서버에서 매번 계산하는 것이 아니라 미리 만들어 둔 파일을 GitHub Pages가 보여주는 방식입니다. 콘텐츠(글·사진·자료·소개 등)는 모두 GitHub 저장소 안의 "파일"로 저장됩니다.'),
  P('관리자가 콘텐츠를 바꾸는 모든 작업은 결국 "저장소의 파일을 수정 → GitHub에 커밋 → GitHub Actions가 자동으로 다시 빌드·배포"로 이어집니다. 그래서 변경 후 사이트에 반영되기까지 보통 1~2분이 걸립니다(실시간 아님).',),
  TABLE(['항목', '내용'], [
    ['사이트 주소', 'https://sk73-choi.github.io/my-website/'],
    ['관리자 주소', 'https://sk73-choi.github.io/my-website/admin'],
    ['저장소', 'https://github.com/sk73-choi/my-website'],
    ['배포 방식', 'master 브랜치에 변경 → GitHub Actions 자동 빌드·배포'],
    ['반영 시간', '변경 후 약 1~2분'],
  ]),
  NOTE('핵심 한 줄: "관리자에서 저장하거나, 저장소 파일을 직접 바꾸면 → 1~2분 뒤 사이트에 자동 반영된다."'),

  PB(),
  H1('2. 사전 준비 — GitHub 토큰 발급 (최초 1회)'),
  P('관리자 페이지에서 콘텐츠를 저장하려면 GitHub 권한이 필요합니다. 아이디/비밀번호 대신 "토큰(Personal Access Token)"으로 로그인합니다.'),
  H2('2-1. Fine-grained 토큰 발급 방법'),
  OL([
    'GitHub 로그인 후 https://github.com/settings/personal-access-tokens/new 접속',
    'Token name: 아무 이름(예: my-website-admin)',
    'Expiration(만료): 30일 또는 90일 권장(만료되면 재발급)',
    'Repository access → "Only select repositories" 선택 → my-website 선택',
    'Permissions → Repository permissions → Contents 를 "Read and write" 로 설정 (Metadata는 자동 Read)',
    'Generate token → 생성된 토큰(github_pat_...)을 복사 (이 화면을 벗어나면 다시 못 봅니다)',
  ]),
  NOTE('토큰은 비밀번호와 같습니다. 화면 공유·메신저·문서에 평문으로 노출하지 마세요. 노출되면 즉시 https://github.com/settings/tokens 에서 삭제(폐기)하고 새로 발급하세요.'),

  PB(),
  H1('3. 관리자 로그인 (실전 가이드)'),
  P('관리자 로그인은 아이디/비밀번호가 아니라 GitHub 토큰으로 합니다. 아래 2단계만 따라 하면 됩니다.'),

  H2('1단계: 토큰 준비 (이미 있으면 건너뛰기)'),
  OL([
    'GitHub 로그인 상태에서 https://github.com/settings/personal-access-tokens/new 접속',
    'Token name: 아무거나 (예: my-website-admin)',
    'Expiration(만료): 30일 또는 90일',
    'Repository access → "Only select repositories" → my-website 선택',
    '아래로 스크롤 → Repository permissions → Contents 를 "Read and write" 로 설정 (Metadata는 자동 Read-only)',
    '맨 아래 Generate token → 나오는 토큰(github_pat_...)을 복사',
  ]),
  NOTE('토큰은 생성 직후 한 번만 보입니다. 이 화면을 벗어나면 다시 볼 수 없으니 바로 복사하세요. 잃어버리면 새로 발급하면 됩니다.'),

  H2('2단계: 관리자 페이지에서 로그인'),
  OL([
    '브라우저에서 https://sk73-choi.github.io/my-website/admin 접속',
    '입력창에 복사한 토큰 붙여넣기',
    '(선택) "이 기기에서 기억하기" 체크 — 개인 PC면 다음부터 자동 로그인',
    '로그인 버튼 클릭 → 관리자 대시보드 진입',
  ]),

  H3('참고'),
  UL([
    '저장소 주인(sk73-choi) 계정의 토큰만 로그인됩니다. 다른 계정·잘못된·만료된 토큰은 거부됩니다.',
    '토큰은 브라우저에만 저장되고 사이트(서버)로 전송·보관되지 않습니다.',
    '로그아웃: 대시보드 우측 위 "로그아웃" 버튼(기억하기도 해제됨).',
    '토큰이 만료되면 저장이 안 됩니다 → 1단계로 새로 발급해 다시 로그인하세요.',
    '로그인이 안 되면: 토큰 오타/만료 여부, 권한(my-website·Contents 쓰기), 소유자 계정인지 확인하세요.',
  ]),
  SHOT('login', '관리자 로그인 화면'),

  H1('4. 대시보드'),
  P('로그인하면 보이는 첫 화면입니다. 편집할 영역(블로그·소개·즐겨찾기·사진·자료실)으로 이동하는 카드와, 배포 진행 상황(GitHub Actions) 링크가 있습니다.'),
  SHOT('dashboard', '관리자 대시보드 (편집 영역 카드 + 배포 상태)'),

  PB(),
  H1('5. 콘텐츠 관리 방법 (영역별)'),
  P('각 영역은 (A) 관리자 페이지에서 편집하거나, (B) 저장소의 해당 파일/폴더를 직접 수정해 push 하는 두 방법을 모두 지원합니다. 둘 다 같은 파일을 바꾸므로 결과가 같습니다.'),

  H2('5-1. 블로그'),
  H3('새 글 작성'),
  OL([
    '대시보드 → 블로그 → "새 글" 클릭',
    '제목 입력 (제목을 쓰면 영문 slug가 자동 제안됨)',
    'slug(파일명, 영문) 확인/수정: 글의 주소가 됩니다. 예) my-first-post → .../blog/my-first-post. 영문 소문자·숫자·하이픈만, 글마다 고유.',
    '날짜(YYYY-MM-DD), 태그(쉼표로 구분), 요약 입력',
    '본문을 마크다운으로 작성. "미리보기" 탭으로 확인',
    '저장 → 1~2분 뒤 블로그 목록/글에 반영',
  ]),
  H3('본문에 이미지 넣기'),
  UL([
    '본문 작성 영역 위의 "이미지" 버튼 → PC에서 이미지 선택 → 자동 업로드 후 커서 위치에 이미지가 삽입됩니다.',
    '이미지는 public/blog-images/ 폴더에 저장됩니다.',
    '코드 블록(``` 로 감싼 부분)은 보는 사람이 "복사" 버튼으로 복사할 수 있습니다.',
  ]),
  H3('수정 / 삭제'),
  UL([
    '수정: 블로그 → 글 목록에서 "수정" → 내용 변경 → 저장',
    '삭제: 글 목록에서 "삭제" (되돌릴 수 없음)',
    '직접 편집(대안): 저장소의 src/posts/{slug}.md 파일을 고치거나 새로 만들어 push',
  ]),
  NOTE('관리자 글 목록은 "마지막 배포 기준"입니다. 새 글/삭제는 배포(1~2분)가 끝나야 목록에 반영됩니다(저장 자체는 즉시 커밋됨).'),
  SHOT('blog-editor', '블로그 글 에디터 (메타 입력 + 마크다운 본문/미리보기 + 이미지 버튼)'),

  H2('5-2. 소개 (About)'),
  P('소개 페이지는 content/about.md 파일 하나가 원본입니다. 관리자(/admin → 소개)에서 편집하거나, 파일을 직접 수정해 push 해도 됩니다.'),
  P('about.md 구조:'),
  UL([
    '맨 위 --- 사이: 프로필 (name / role / location / email / github)',
    '## 소개 : 각 줄이 한 문단으로 표시',
    '## 스킬 : "### 그룹명 | 아이콘" 다음 줄에 항목들을 쉼표로 나열',
    '## 발자취 : "### 기간 | 아이콘" 다음 줄=제목, 그 다음 줄=설명',
    '아이콘 이름(택1): Code2, Wrench, Sparkles, Briefcase, GraduationCap',
  ]),
  NOTE('섹션 제목(소개/스킬/발자취)은 인식용 표시이므로 그대로 두세요. 형식을 지키면 화면에 자동 반영됩니다.'),
  SHOT('about', '소개 편집 화면 (마크다운 파일 편집)'),

  H2('5-3. 즐겨찾기 (Favorites)'),
  P('즐겨찾기는 content/favorites.md 파일이 원본입니다. 관리자(/admin → 즐겨찾기)에서 편집하거나 파일 직접 수정 모두 가능합니다.'),
  P('favorites.md 구조:'),
  UL([
    '"## 카테고리명" 으로 카테고리를 만듭니다(링크가 없어도 제목만 두면 빈 카테고리).',
    '링크는 한 줄에 하나씩: - [제목](URL) — 설명   (설명은 생략 가능)',
    '카테고리를 적은 순서 = 사이트 노출 순서',
  ]),
  P('예시:'),
  P('## AI'),
  P('- [Anthropic](https://www.anthropic.com) — Claude 개발사'),
  SHOT('favorites', '즐겨찾기 편집 화면'),

  H2('5-4. 사진 (Photos)'),
  P('사진은 public/photos/{카테고리}/ 폴더가 원본입니다. 폴더에 이미지를 넣거나 지우면, 빌드 시 썸네일과 목록이 자동 생성되어 사이트에 반영됩니다. 두 가지 방법이 있습니다.'),
  H3('방법 A — 프로젝트 폴더에서 일괄 업데이트'),
  OL([
    'public/photos/여행/ 등 카테고리 폴더에 이미지 파일을 복사해 넣기(또는 삭제)',
    '새 카테고리: public/photos/새이름/ 폴더를 새로 만들고 이미지를 넣으면 됨',
    '변경을 저장소에 push (git add → commit → push)',
    '→ GitHub Actions가 빌드하며 썸네일·목록 자동 생성 → 1~2분 뒤 반영',
  ]),
  H3('방법 B — 관리자 페이지'),
  OL([
    '대시보드 → 사진',
    '업로드 카테고리 선택 → "이미지 업로드(여러 장)" → PC에서 선택 → 즉시 업로드',
    '사진 삭제: 각 사진의 휴지통 아이콘',
    '카테고리 추가: 이름 입력 → "카테고리 추가"',
  ]),
  UL([
    '썸네일은 빌드 시 자동 생성되므로 직접 만들 필요가 없습니다(원본만 올리면 됨).',
    '원본은 원래 크기로 저장됩니다. 사진이 매우 크면 저장소 용량이 커지니 적당히 줄여서 올리는 것을 권장합니다.',
    '기본 카테고리: 여행, 정보, ZARD, 취미, 개인',
  ]),
  SHOT('photos', '사진 관리 화면 (카테고리별 썸네일 + 업로드/삭제)'),

  H2('5-5. 자료실 (Files)'),
  P('자료실은 사진과 같은 "폴더 방식"입니다. public/files/{카테고리}/ 폴더가 원본이며, 폴더에 파일을 넣거나 지우면 빌드 시 목록이 자동 생성됩니다. 제목=파일명, 유형·크기·날짜는 자동입니다.'),
  H3('방법 A — 프로젝트 폴더에서 일괄'),
  OL([
    'public/files/IT/, public/files/매뉴얼/ 등 카테고리 폴더에 파일을 복사해 넣기(또는 삭제)',
    '새 카테고리: public/files/새이름/ 폴더를 만들고 파일을 넣으면 됨',
    '변경을 저장소에 push → 빌드 후 1~2분 뒤 반영',
  ]),
  H3('방법 B — 관리자 페이지'),
  OL([
    '대시보드 → 자료실',
    '업로드 카테고리 선택 → "파일 업로드(여러 개)" → PC 파일 선택',
    '자료 삭제: 각 파일의 휴지통 아이콘',
    '카테고리 추가: 이름 입력 → "카테고리 추가"',
  ]),
  UL([
    'PDF는 사이트에서 "보기"로 미리보기가 됩니다(그 외 형식은 다운로드).',
    '제목은 파일명에서 자동 생성됩니다. 제목을 바꾸려면 파일명을 바꿔서 올리세요.',
  ]),
  SHOT('files', '자료실 관리 화면 (카테고리별 파일 + 업로드/삭제)'),

  PB(),
  H1('6. 배포와 반영 — 언제 사이트에 보이나'),
  UL([
    '관리자에서 저장하거나 파일을 push하면 → GitHub Actions가 자동으로 빌드·배포합니다.',
    '보통 1~2분 소요. 실시간이 아닙니다.',
    '진행 상황: 저장소 → Actions 탭 (대시보드의 "배포 진행 상황 보기" 링크).',
    '바뀐 내용이 안 보이면 브라우저 강력 새로고침(Ctrl+Shift+R).',
  ]),
  TABLE(['작업', '관리자 화면', '방문자 사이트'], [
    ['글/소개/즐겨찾기/자료 저장', '즉시 반영', '1~2분 뒤'],
    ['사진 업로드/삭제(관리자)', '즉시 목록 갱신', '1~2분 뒤'],
    ['폴더/파일 직접 수정 후 push', '-', '1~2분 뒤'],
  ]),

  H1('7. 내가 직접 알아야 할 폴더/파일 (직접 편집용)'),
  TABLE(['콘텐츠', '위치', '비고'], [
    ['블로그 글', 'src/posts/{slug}.md', '상단 frontmatter + 마크다운 본문'],
    ['블로그 이미지', 'public/blog-images/', '본문 이미지 저장'],
    ['소개', 'content/about.md', '프로필/소개/스킬/발자취'],
    ['즐겨찾기', 'content/favorites.md', '## 카테고리 + 링크'],
    ['사진', 'public/photos/{카테고리}/', '이미지 넣으면 썸네일 자동 생성'],
    ['자료실', 'public/files/{카테고리}/', '파일 넣으면 목록 자동 생성(제목=파일명)'],
  ]),

  PB(),
  H1('8. 관리 포인트 체크리스트'),
  UL([
    '토큰 만료 관리: 만료되면 관리자 저장이 안 됩니다 → 새 토큰 발급 후 다시 로그인.',
    '토큰 보안: 노출되면 즉시 폐기(https://github.com/settings/tokens) 후 재발급.',
    '큰 이미지/파일 주의: 원본이 그대로 저장소에 쌓이므로, 너무 큰 파일은 줄여서 업로드.',
    '백업: 저장소(GitHub) 자체가 모든 콘텐츠의 백업입니다. 별도 백업이 필요하면 저장소를 클론/다운로드.',
    '공유 썸네일(선택): 카톡/트위터 공유 카드에 이미지를 넣으려면 public/og.png(1200×630)를 추가하고 src/lib/site.js의 image 값을 설정.',
    '워크플로 파일(.github/workflows) 수정 시: 토큰에 workflow 권한이 필요(일반 콘텐츠 편집에는 불필요).',
  ]),

  H1('9. 문제 해결 (FAQ)'),
  H3('로그인이 안 돼요'),
  UL([
    '토큰이 만료/오타가 아닌지 확인',
    '토큰 권한: 저장소 my-website / Contents Read and write 인지 확인',
    '소유자(sk73-choi) 계정의 토큰인지 확인',
  ]),
  H3('저장(커밋)이 실패해요'),
  UL([
    '토큰 권한(Contents 쓰기) 확인',
    '같은 파일을 동시에 다른 곳에서 수정하면 충돌할 수 있음 → 새로고침 후 다시 시도',
  ]),
  H3('바꿨는데 사이트에 안 보여요'),
  UL([
    '배포에 1~2분 걸립니다. Actions 탭에서 빌드 성공 확인',
    '브라우저 캐시: Ctrl+Shift+R 로 강력 새로고침',
    '사진/이미지: 폴더 방식은 push 후 빌드가 끝나야 보입니다',
  ]),
  H3('로컬에서 미리 보고 싶어요 (선택)'),
  UL([
    'Node.js 설치 후 프로젝트 폴더에서: npm install → npm run dev',
    '표시되는 http://localhost:5173/my-website/ 로 접속(빌드 전 미리보기). 사진 썸네일도 자동 생성됨',
  ]),

  H1('10. 빠른 참조'),
  TABLE(['하고 싶은 것', '어디서', '어떻게'], [
    ['블로그 글 쓰기', '/admin → 블로그', '새 글 → 작성 → 저장'],
    ['글에 이미지', '블로그 에디터', '"이미지" 버튼'],
    ['소개 수정', '/admin → 소개', 'content/about.md 편집'],
    ['즐겨찾기 추가', '/admin → 즐겨찾기', '## 카테고리에 - [제목](URL) 추가'],
    ['사진 올리기', '/admin → 사진 또는 폴더', '업로드 / public/photos/{카테고리}/'],
    ['자료 올리기', '/admin → 자료실', '자료 추가 → 파일 업로드 → 저장'],
    ['배포 확인', 'GitHub', 'Actions 탭'],
  ]),
  NOTE('이 매뉴얼의 스크린샷 자리는, 해당 화면 이미지를 docs/screenshots/ 에 약속된 파일명(login.png, dashboard.png, blog-editor.png, about.png, favorites.png, photos.png, files.png)으로 넣고 매뉴얼을 다시 생성하면 자동으로 채워집니다.'),
]

content.push(...render(body))

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{ properties: {}, children: content }],
})

const buffer = await Packer.toBuffer(doc)
writeFileSync('docs/관리자_매뉴얼.docx', buffer)
console.log('[manual] docs/관리자_매뉴얼.docx 생성 완료')
