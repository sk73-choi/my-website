// 블로그 본문의 <div data-demo="이름"></div> 자리에 렌더링되는 UI 데모 레지스트리.
// BlogPost 에서 lazy import 하므로 데모가 있는 글을 열 때만 이 청크를 불러온다.
import * as L from './LayoutDemos'
import * as C from './ComponentDemos'
import * as E from './EffectDemos'
import * as P from './PagePreview'

const DEMOS = {
  // 레이아웃
  hero: L.HeroDemo,
  responsive: L.ResponsiveDemo,
  card: L.CardDemo,
  bento: L.BentoDemo,
  sidebar: L.SidebarDemo,
  'sticky-header': L.StickyHeaderDemo,
  split: L.SplitDemo,
  // 컴포넌트
  tabs: C.TabsDemo,
  accordion: C.AccordionDemo,
  modal: C.ModalDemo,
  drawer: C.DrawerDemo,
  dropdown: C.DropdownDemo,
  tooltip: C.TooltipDemo,
  toast: C.ToastDemo,
  carousel: C.CarouselDemo,
  skeleton: C.SkeletonDemo,
  // 인터랙션·효과
  hover: E.HoverDemo,
  'scroll-reveal': E.ScrollRevealDemo,
  stagger: E.StaggerDemo,
  'smooth-transition': E.SmoothTransitionDemo,
  glass: E.GlassDemo,
  parallax: E.ParallaxDemo,
  'scroll-snap': E.ScrollSnapDemo,
  micro: E.MicroDemo,
  // 종합 프롬프트 → 실제 페이지(/demo/*) iframe 미리보기
  'landing-page': P.LandingPagePreview,
  'dashboard-page': P.DashboardPagePreview,
}

export default function UiDemo({ name }) {
  const Demo = DEMOS[name]
  if (!Demo) return null
  return <Demo />
}
