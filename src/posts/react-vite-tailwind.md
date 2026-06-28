---
title: React + Vite + Tailwind로 사이트 만들기
date: 2026-06-20
excerpt: Vite 기반 React 프로젝트에 Tailwind CSS v4를 적용하고 라우팅 구조를 잡은 과정을 공유합니다.
tags: [React, Vite, Tailwind]
---

# React + Vite + Tailwind로 사이트 만들기

이 사이트는 **React + Vite + Tailwind CSS v4** 조합으로 만들었습니다. 설정 과정을 간단히 정리합니다.

## 1. 프로젝트 생성

Vite로 React 템플릿을 생성합니다.

```bash
npm create vite@latest my-site -- --template react
cd my-site
npm install
```

## 2. Tailwind CSS v4 적용

v4부터는 `tailwind.config.js` 없이 **Vite 플러그인**만으로 동작합니다.

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/my-website/',
  plugins: [react(), tailwindcss()],
})
```

CSS 진입점에는 한 줄만 추가하면 됩니다.

```css
@import 'tailwindcss';
```

## 3. 라우팅 구조

React Router로 페이지를 나눕니다.

| 경로 | 페이지 |
| --- | --- |
| `/` | 홈 |
| `/blog` | 블로그 목록 |
| `/blog/:slug` | 글 상세 |
| `/files` | 자료실 |

## 마무리

설정이 끝나면 `npm run dev`로 개발 서버를 띄우고, 컴포넌트를 하나씩 채워나가면 됩니다.

```jsx
function App() {
  return <h1 className="text-3xl font-bold">Hello Tailwind!</h1>
}
```

다음 글에서는 GitHub Pages 배포를 다루겠습니다.
