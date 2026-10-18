import { Link as SiteLink } from '../../lib/router'
import { scrollToSection } from '../../lib/useSmoothScroll'

export function Link({ to, onClick, children, ...props }) {
  if (!to.startsWith('#')) return <SiteLink to={to} onClick={onClick} {...props}>{children}</SiteLink>
  return <a href={to} {...props} onClick={(event) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    scrollToSection(to)
  }}>{children}</a>
}
