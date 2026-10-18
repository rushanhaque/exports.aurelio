/* ============================================================
   <SplitText> — word-by-word mask reveal for headings.
   Each word rises out of its own clip mask. Slow, elegant,
   never bouncy. Pass a string as children.

   The inter-word space is a real text node BETWEEN the word
   masks (not inside them) — an inline-flex span discards
   whitespace-only children, which previously ran words together.

   Usage:
     <SplitText as="h2" className="h2">Heirloom metalware</SplitText>
   ============================================================ */
import { Fragment, useRef } from 'react'
import { gsap, useGSAP, EASE_LONG, prefersReducedMotion } from '../../lib/gsap'
import './SplitText.css'

export default function SplitText({
  as: Tag = 'h2',
  children = '',
  className = '',
  delay = 0,
  start = 'top bottom',
  duration = 0.95,
  stagger = 0.06,
  ...rest
}) {
  const ref = useRef(null)
  const text = String(children)
  const words = text.split(' ')

  useGSAP(
    () => {
      const inners = ref.current.querySelectorAll('.st-inner')

      if (prefersReducedMotion) {
        gsap.set(inners, { y: 0, yPercent: 0 })
        return
      }

      const rect = ref.current.getBoundingClientRect()
      const alreadyVisible = rect.top < window.innerHeight
      // Explicit start/end transforms prevent refreshes from retaining a
      // pixel offset and leaving the words hidden inside their masks.
      gsap.fromTo(inners, { y: 0, yPercent: 118 }, {
        y: 0,
        yPercent: 0,
        clearProps: 'transform',
        duration,
        ease: EASE_LONG,
        delay,
        stagger,
        ...(alreadyVisible
          ? {}
          : { scrollTrigger: { trigger: ref.current, start, once: true, invalidateOnRefresh: true } }),
      })
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={`st ${className}`} {...rest} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="st-word" aria-hidden="true">
            <span className="st-inner">{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
