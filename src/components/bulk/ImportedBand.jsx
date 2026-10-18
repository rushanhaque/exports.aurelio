import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { scrollToSection } from '../../lib/useSmoothScroll'
import './source.css'
import './integration.css'

export default function ImportedBand({ tone = 'white', children }) {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let pending = [...root.querySelectorAll('[data-reveal]')]
    let frame = 0
    const reveal = () => {
      frame = 0
      pending = pending.filter(node => {
        if (!reduce.matches && node.getBoundingClientRect().top >= window.innerHeight * 0.94) return true
        node.dataset.revealed = 'true'
        return false
      })
    }
    const update = () => { if (!frame && pending.length) frame = requestAnimationFrame(reveal) }
    const motion = () => { root.dataset.motion = reduce.matches ? 'off' : 'on'; update() }
    motion()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    reduce.addEventListener('change', motion)
    const resize = new ResizeObserver(update)
    resize.observe(root)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      reduce.removeEventListener('change', motion)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const reading = ref.current.querySelector('.story-reading')
      if (reading) gsap.fromTo(reading.querySelectorAll('.reading-word'), { color: '#7d8b86' }, {
        color: '#072319', stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: reading, start: 'top 85%', end: 'bottom 40%', scrub: 0.5 },
      })
      const scene = ref.current.querySelector('.commission-scene')
      if (scene) gsap.fromTo(scene.querySelector('img'), { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })
    })
    return () => media.revert()
  }, { scope: ref })

  const followAnchor = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    const link = event.target.closest('a[href^="#"]')
    if (!link || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const target = document.getElementById(link.getAttribute('href').slice(1))
    if (!target) return
    event.preventDefault()
    scrollToSection(target)
  }

  return <div ref={ref} className="imported-bulk" onClick={followAnchor}>
    <div className="bulk-sections">
      <div className={`bulk-band bulk-band--${tone}`}>{children}</div>
    </div>
  </div>
}
