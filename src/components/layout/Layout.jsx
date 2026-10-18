/* ============================================================
   <Layout> — the persistent shell around every route.
   Mounts smooth-scroll once, keeps the nav/footer/progress bar
   across navigations, resets scroll on route change and refreshes
   ScrollTrigger once the new page has painted.
   ============================================================ */
import { useEffect } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { useSmoothScroll } from '../../lib/useSmoothScroll'
import { useLocation } from '../../lib/router'
import { EnquiryProvider } from '../../lib/enquiry'
import ProgressBar from '../ui/ProgressBar'
import PageIntro from '../ui/PageIntro'
import ClickSpark from '../ui/ClickSpark'
import Concierge from '../ui/Concierge'
import EnquiryDrawer from '../ui/EnquiryDrawer'
import Navbar from '../sections/Navbar'
import Footer from '../sections/Footer'

export default function Layout({ children }) {
  useSmoothScroll()
  const path = useLocation()

  useEffect(() => {
    // jump to the top of the new page
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
    // A lazy route may mount after this effect. Wait for its anchor so links
    // from the material explorer land on the chosen material, not the hero.
    let observer
    const scrollToAnchor = () => {
      if (!window.location.hash) return
      let anchor
      try { anchor = document.getElementById(decodeURIComponent(window.location.hash.slice(1))) }
      catch { return }
      if (!anchor) return
      ScrollTrigger.refresh()
      if (window.__lenis) {
        // The lazy page can be much taller than the initial shell. Update
        // Lenis's bounds before it clamps the requested anchor position.
        window.__lenis.resize()
        window.__lenis.scrollTo(anchor, { immediate: true, offset: -90 })
      }
      else anchor.scrollIntoView({ behavior: 'instant' })
      observer?.disconnect()
    }
    if (window.location.hash) {
      observer = new MutationObserver(scrollToAnchor)
      observer.observe(document.getElementById('main'), { childList: true, subtree: true })
    }
    const id = requestAnimationFrame(() => { ScrollTrigger.refresh(); scrollToAnchor() })
    return () => { cancelAnimationFrame(id); observer?.disconnect() }
  }, [path])

  return (
    <EnquiryProvider>
      <ClickSpark sparkColor="#0E3B2C" sparkSize={11} sparkRadius={16} sparkCount={8} duration={520}>
        <a href="#main" className="skip-link">Skip to content</a>
        <ProgressBar />
        <PageIntro />
        <Navbar />
        {/* key forces a fresh mount per route so GSAP timelines re-run cleanly */}
        <main id="main" key={path}>{children}</main>
        <Footer />
        <Concierge />
        <EnquiryDrawer />
        {/* barely-there printed-catalogue grain over the whole site */}
        <div className="film-grain" aria-hidden="true" />
      </ClickSpark>
    </EnquiryProvider>
  )
}
