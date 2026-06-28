import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import 'highlight.js/styles/github-dark.css'
import './index.css'
import App from './App.jsx'

// GitHub Pages 서브경로(base) 아래에서도 라우팅이 동작하도록 basename 지정
const basename = import.meta.env.BASE_URL

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      {/* reducedMotion="user": OS '동작 줄이기' 설정 시 애니메이션 자동 완화 */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
