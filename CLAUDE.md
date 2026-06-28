# 개인 웹사이트 프로젝트
 
## 프로젝트 개요
React + Vite + Tailwind CSS 기반 개인 포트폴리오 & 블로그 웹사이트.
GitHub Pages로 배포. 파일 자료실(PDF/PPT/Excel/Word/MD) 포함.
 
## 기술 스택 (실제 설치 버전)
- Framework: React 19 + Vite
- Styling: Tailwind CSS v4 (@tailwindcss/vite, 설정 파일 없는 CSS @import 방식)
- Routing: React Router v7
- Animation: Framer Motion (글라스모피즘 + 그라데이션 UI)
- Markdown: react-markdown + remark-gfm + rehype-highlight(코드 하이라이트)
- PDF Viewer: react-pdf (pdfjs-dist)
- Icons: Lucide React (브랜드 아이콘은 components/icons.jsx 인라인 SVG)
- Deploy: GitHub Pages + GitHub Actions (master push → 자동 빌드·배포)
 
## 폴더 구조
- src/pages/: 페이지 컴포넌트 (Home, Blog, BlogPost, Files, Favorites, About, NotFound)
- src/components/: 공통 컴포넌트 (Navbar, Footer, Layout, Background, FileCard,
  PdfViewer, motion, icons)
- src/admin/: 관리자(원격 편집) — AdminApp, AuthContext, AdminLogin, AdminDashboard,
  AdminBlog, BlogEditor, AdminAbout, AdminFiles, AdminFavorites, AdminShell
- src/data/: 콘텐츠 데이터 (files.json, about.json, bookmarks.json, posts.js=md 파싱,
  files.js, bookmarks.js)
- src/posts/: 마크다운 블로그 글 (상단 frontmatter: title/date/excerpt/tags)
- src/lib/: 유틸 (github.js=GitHub API, frontmatter.js, upload.js, variants.js, format.js)
- public/files/: 업로드 파일 저장소 (카테고리별 폴더)
 
## 네비게이션 순서
홈 · 소개 · 블로그 · 즐겨찾기 · 사진 · 자료실 (강조색: 홈=보라, 소개=하늘,
블로그=초록(라임→틸), 즐겨찾기=주황, 사진=노랑→분홍, 자료실=보라)
 
## 콘텐츠 모델 (편집 대상)
- 블로그 글: src/posts/{slug}.md (frontmatter + 본문, 이미지=public/blog-images/)
- 자료실: public/files/{카테고리}/ 폴더가 원본. 폴더에 파일 추가/삭제 → 빌드 시
  prebuild(scripts/generate-files.mjs)가 manifest(src/data/files.generated.json) 생성
  (제목=파일명, 유형·크기·날짜 자동). 관리자(/admin/files)도 같은 폴더를 편집.
- 사진: public/photos/{카테고리}/ 폴더가 원본. 폴더에 이미지 추가/삭제 → 빌드 시
  prebuild(scripts/generate-photos.mjs)가 썸네일(.../thumbs/) + manifest
  (src/data/photos.generated.json) 생성. 관리자(/admin/photos)도 같은 폴더를 편집.
- 소개: content/about.md  (frontmatter 프로필 + 소개/스킬/발자취 섹션)
- 즐겨찾기: content/favorites.md  (## 카테고리 + "- [제목](URL) — 설명" 링크)
- 소개·즐겨찾기는 content/*.md 가 단일 원본 → 파일 직접 수정/push 또는 관리자(/admin)
  에서 편집(둘 다 같은 md 파일을 고침). 파서: src/lib/aboutMd.js, favoritesMd.js
 
## 파일 추가 방법 (권장: 관리자 /admin)
- 관리자에서 자료실 → 파일 업로드 → 저장하면 커밋·배포까지 자동.
- 수동 시: public/files/{폴더}/ 에 파일 복사 → files.json 의 files 에 항목 추가 → push.
 
## 코딩 컨벤션
- 컴포넌트: PascalCase, 함수형 컴포넌트
- 파일명: PascalCase.jsx (컴포넌트), camelCase.js (유틸/데이터)
- 스타일: Tailwind 클래스 우선, 복잡한 경우만 CSS 모듈
- 주석: 한국어로 작성
 
## 배포 (GitHub Actions 자동화)
- master 에 push → .github/workflows/deploy.yml 이 빌드·배포 (약 1~2분)
- 수동 npm run deploy / gh-pages 는 제거됨 (Actions 로 일원화)
- GitHub Pages URL: https://sk73-choi.github.io/my-website/
- 저장소: https://github.com/sk73-choi/my-website (소스=master, 배포=Actions)
 
## 관리자 / 원격 편집 (/admin)
- 정적 사이트라 별도 백엔드 없음. GitHub 토큰으로 인증 → GitHub Contents API 로
  콘텐츠 파일을 커밋 → Actions 자동 배포 방식.
- 로그인: Fine-grained PAT (저장소 my-website / Contents Read·Write).
  저장소 소유자(sk73-choi)만 허용. 토큰은 브라우저(session/local)에만 저장.
- 1단계(완료): 인증 + 콘텐츠 데이터화 + 대시보드
- 2단계(완료): 블로그(작성·수정·삭제+미리보기), 소개 폼, 자료 메타데이터 에디터
  → 각 저장이 GitHub Contents API 커밋 → Actions 자동 배포
- 3단계(완료): 자료실 파일 업로드 — 파일을 base64로 커밋(public/files/{폴더}/),
  경로·유형·크기 자동 입력 후 files.json 저장
- 즐겨찾기(완료): 카테고리 추가/삭제 + 카테고리별 사이트 링크 등록(bookmarks.json)
- 자료실 카테고리 동적화(완료): files.json 의 categories 를 관리자에서 추가/삭제
 
## 현재 구현 상태
- [x] 1단계: 초기 세팅
- [x] 2단계: 레이아웃 & 라우팅
- [x] 3단계: Home 페이지
- [x] 4단계: Blog 시스템
- [x] 5단계: Files 자료실
- [x] 6단계: PDF 뷰어
- [x] 7단계: About 페이지
- [x] 8단계: GitHub Pages 배포
- [x] UI 리디자인 (글라스모피즘 + Framer Motion)
- [x] 자동 배포 전환 (GitHub Actions)
- [x] 관리자 원격 편집 1단계 (인증 + 콘텐츠 데이터화)
- [x] 관리자 원격 편집 2단계 (블로그/소개/자료 에디터)
- [x] 관리자 원격 편집 3단계 (파일 업로드)
- [x] 즐겨찾기(북마크) 메뉴 + 관리자 편집 (주황 테마)
- [x] 자료실 카테고리 동적 관리 (즐겨찾기와 동일 방식)
- [x] 검색: 페이지별 검색바(블로그/자료실/즐겨찾기) + Navbar 전역 통합검색(Ctrl+K)
- [x] 블로그 본문 이미지 삽입(public/blog-images/) + 코드 복사 버튼
- [x] 다크/라이트 토글(.dark on html, localStorage, FOUC 방지)
- [x] SEO: 페이지별 메타/OG/Twitter/JSON-LD, robots.txt, prebuild 로 sitemap.xml·rss.xml 생성
- [x] 읽기 경험: 읽는시간, 목차(TOC), 스크롤 진행바, 이전/다음 글, 맨 위로
- [x] 성능: 라우트 lazy-load(BlogPost/Files/Admin 분리) / 접근성: skip-link, reduced-motion
