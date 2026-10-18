import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { Link } from '../../lib/router'
import { scrollToSection } from '../../lib/useSmoothScroll'
import { COLLECTIONS } from '../../data/collections'
import './Categories.css'

// Collection story from Aurelio_Ecom's bulk-orders page. Keep the catalogue's
// existing cover art and destinations, with the source section's concise copy.
const STORY_COPY = {
  urns: 'The oldest form we make. Raised in copper or cast in bronze, built to last a century.',
  lighting: 'Spun, raised or cast by hand. Wired and balanced to hang quietly.',
  furniture: 'Forged frames and honest joinery. Built to outlast the room.',
  kitchenware: 'Cast, hammered and hand-polished. Made to be used hard.',
  decor: 'Cast vessels and patinated reliefs. Sculpture for living with.',
  accessories: 'Small objects, finished to the same standard as the large.',
  bespoke: 'One object or a whole interior, developed with you from sketch to delivery.',
}

function ArrowUpRight() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  )
}

export default function Categories() {
  const ref = useRef(null)

  useGSAP(() => {
    const root = ref.current
    const panels = gsap.utils.toArray('.making-panel', root)
    const media = gsap.matchMedia()

    // Native sticky positioning and the source timeline reveal one collection
    // at a time. Short screens keep the flowing layout so the copy always fits.
    media.add('(min-width: 901px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)', () => {
      root.classList.add('is-choreographed')
      gsap.set(panels.slice(1), { autoAlpha: 0 })

      const story = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
        },
      })

      panels.forEach((panel, i) => {
        if (i > 0) {
          story
            .to(panels[i - 1], { autoAlpha: 0, duration: 0.2 }, i - 0.22)
            .to(panel, { autoAlpha: 1, duration: 0.2 }, i - 0.1)
            .fromTo(
              panel.querySelector('.making-image'),
              { clipPath: 'inset(50% 0% 50% 0%)', scale: 0.94, rotation: -3 },
              { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, rotation: 0, duration: 0.55, ease: 'power2.out' },
              i - 0.1,
            )
            .fromTo(
              panel.querySelectorAll('.making-line > *'),
              { yPercent: 115 },
              { yPercent: 0, stagger: 0.08, duration: 0.45, ease: 'power3.out' },
              i,
            )
        }

        story.fromTo(
          panel.querySelector('.making-image img'),
          { scale: 1.12 },
          { scale: 1, duration: 0.95, ease: 'none' },
          i,
        )
      })

      story.to(root.querySelector('.making-track i'), { scaleX: 1, duration: panels.length, ease: 'none' }, 0)

      const path = root.querySelector('.making-thread path')
      const length = path.getTotalLength()
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      story.to(path, { strokeDashoffset: 0, duration: panels.length, ease: 'none' }, 0)

      return () => root.classList.remove('is-choreographed')
    })

    media.add('((max-width: 900px) or (max-height: 619px)) and (prefers-reduced-motion: no-preference)', () => {
      panels.forEach((panel) => {
        gsap.fromTo(
          panel.querySelectorAll('.making-line > *'),
          { yPercent: 105 },
          {
            yPercent: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: panel, start: 'top 85%', once: true },
          },
        )
        const image = panel.querySelector('.making-image')
        gsap.fromTo(image, { clipPath: 'inset(12% 0% 12% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: image, start: 'top 95%', end: 'top 30%', scrub: 0.6 },
        })
      })
    })

    return () => media.revert()
  }, { scope: ref })

  const meetObjects = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    scrollToSection('#gallery')
  }

  return (
    <section ref={ref} id="collections" className="making-story" aria-labelledby="making-title" style={{ '--acts': COLLECTIONS.length }}>
      <h2 className="making-title" id="making-title">Seven collections, one atelier.</h2>
      <div className="making-stage">
        <div className="making-topline"><span>THE COLLECTIONS</span></div>
        <svg className="making-thread" viewBox="0 0 1000 800" fill="none" aria-hidden="true">
          <path d="M -30 690 C 330 800 130 70 490 85 C 930 90 910 740 565 735 C 285 730 380 215 770 130 C 950 90 1010 210 1060 360" />
        </svg>
        <div className="making-panels">
          {COLLECTIONS.map((collection) => {
            const destination = collection.slug === 'bespoke' ? '/contact' : `/collections/${collection.slug}`
            return (
              <article className="making-panel" key={collection.slug}>
                <div className="making-copy">
                  <h3>
                    <span className="making-line"><span>{collection.name}</span></span>
                    <span className="making-line"><em>{collection.slug === 'bespoke' ? 'Drawn to your brief.' : collection.tagline}</em></span>
                  </h3>
                  <p>{STORY_COPY[collection.slug]}</p>
                  <Link className="making-link" to={destination}>
                    {collection.slug === 'bespoke' ? 'Begin a commission' : `Explore ${collection.name.toLowerCase()}`}
                    <ArrowUpRight />
                  </Link>
                </div>
                <Link className="making-image" to={destination} tabIndex={-1} aria-hidden="true">
                  {/* Hidden desktop panels need their images before the scroll reveal. */}
                  <img src={collection.cover} alt="" width="1024" height="1024" loading="eager" decoding="async" />
                </Link>
              </article>
            )
          })}
        </div>
        <div className="making-bottom">
          <div className="making-track" aria-hidden="true"><i /></div>
          <a href="#gallery" onClick={meetObjects}>MEET THE OBJECTS <ArrowUpRight /></a>
        </div>
      </div>
    </section>
  )
}
