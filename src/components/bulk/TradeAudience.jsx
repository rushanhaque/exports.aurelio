import { ArrowUpRight } from 'lucide-react'
import { Words } from './motion-text'

const audiences = [
  {
    title: 'Hospitality & interiors',
    copy: 'Lighting and furniture for hotels, restaurants and residences.',
    image: 'hospitality-interiors',
  },
  {
    title: 'Corporate gifting',
    copy: 'Gifts worth keeping, branded or engraved.',
    image: 'corporate-gifting',
  },
  {
    title: 'Retail & wholesale',
    copy: 'A ready range or your own line for your store.',
    image: 'retail-wholesale',
  },
  {
    title: 'Bespoke projects',
    copy: 'Your drawing, made in metal and wood.',
    image: 'bespoke-projects',
  },
]

export function TradeAudience() {
  return (
    <section className="section container trade-serve" id="who-we-make-for" aria-labelledby="audience-title">
      <h2 className="trade-kicker" id="audience-title" data-reveal="words">
        <Words>Who we <em>make for.</em></Words>
      </h2>
      <div className="serve-grid">
        {audiences.map(({ title, copy, image }) => (
          <a key={title} href="#enquire" className="serve-card">
            <img
              src={`/images/bulk/audience/${image}-v1-800.webp`}
              srcSet={[480, 800, 1086].map(width => `/images/bulk/audience/${image}-v1-${width}.webp ${width}w`).join(', ')}
              sizes="(max-width: 480px) 90vw, (max-width: 900px) 45vw, 23vw"
              width={1086}
              height={1448}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="serve-veil" aria-hidden="true" />
            <span className="serve-body">
              <strong>{title}</strong>
              <small>{copy}</small>
              <span className="serve-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
