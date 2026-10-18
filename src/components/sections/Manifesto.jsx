/* ============================================================
   The Aurelio Standard — the philosophy pause after the worlds.
   Opens on the house "spine", then a two-tone serif statement.
   Reveal the statement as a whole so its words remain readable
   after direct links and layout refreshes. A faint "II" anchors it.
   ============================================================ */
import { useRef } from 'react'
import SectionHeader from '../ui/SectionHeader'
import Reveal from '../ui/Reveal'
import './Manifesto.css'

const CREDO = ['Made by hand', 'Made to last', 'Made once']

export default function Manifesto() {
  const ref = useRef(null)

  return (
    <section ref={ref} id="manifesto" className="section man on-dark">
      <span className="man-bg-num" aria-hidden="true">II</span>

      <div className="container man-inner">
        <SectionHeader kicker="The Aurelio Standard" index="02" total="08" />

        <Reveal as="h2" className="man-statement">
          <span className="man-line man-line--1">
            We make objects that refuse
          </span>{' '}
          <span className="man-line man-line--1">
            to be disposable —
          </span>{' '}
          <span className="man-line man-line--2 serif-italic">
            metal raised slowly, to outlive us.
          </span>
        </Reveal>

        <div className="man-foot">
          <Reveal as="p" className="lead man-support">
            Founded in 2008 in Moradabad, Aurelio is a family atelier devoted to a
            single idea: that the things we live with should be made once, and made
            well enough to be passed on.
          </Reveal>

          <div className="man-aside">
            <Reveal as="ul" className="man-credo" stagger>
              {CREDO.map((item) => (
                <li className="man-credo-item" key={item}>{item}</li>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
