import './Hero.css'

export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <img
        className="hero-background"
        src="/images/bulk/brand/furniture-1440.webp"
        srcSet="/images/bulk/brand/furniture-800.webp 800w, /images/bulk/brand/furniture-1440.webp 1440w"
        sizes="100vw"
        alt=""
        fetchpriority="high"
      />
      <div className="hero-inner">
        <p className="hero-eyebrow">Aurelio — Bulk orders &amp; export</p>
        <h1 id="hero-title" className="hero-title">
          <span>Metal, wrought </span>
          <span>into <em>permanence.</em></span>
        </h1>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <svg viewBox="0 0 12 28" width="12" height="28">
          <path d="M6 0v26m-4-4 4 4 4-4" />
        </svg>
      </div>
    </section>
  )
}
