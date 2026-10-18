import { useEffect, useRef } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { Link } from './navigation'

export function Picture({ name, alt, className = '', eager = false, sizes = '(max-width: 600px) 90vw, 50vw' }) {
  return <img className={className} src={`/images/bulk/${name}-800.webp`}
    srcSet={`/images/bulk/${name}-480.webp 480w, /images/bulk/${name}-800.webp 800w, /images/bulk/${name}-1440.webp 1440w`}
    sizes={sizes} alt={alt} width={1024} height={1024}
    loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

export function Field({ label, name, type = 'text', required = true, ...props }) {
  return <label className="field">
    <span>{label}{!required && <small> (optional)</small>}</span>
    <input name={name} type={type} required={required} {...props} />
  </label>
}

export function Success({ title, children }) {
  const region = useRef(null)
  useEffect(() => { region.current?.focus({ preventScroll: true }) }, [])
  return <div className="success-state" ref={region} tabIndex={-1} role="status">
    <span className="success-icon"><Check size={25} /></span>
    <h2>{title}</h2><div>{children}</div>
    <Link to="/collections" className="text-link">Explore the collections <ArrowRight size={18} /></Link>
  </div>
}
