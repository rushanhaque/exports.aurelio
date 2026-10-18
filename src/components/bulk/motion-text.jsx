import { Children, Fragment, cloneElement, isValidElement } from 'react'
export function Words({ children }) {
  let index = 0
  const split = (node) => {
    if (typeof node === 'string' || typeof node === 'number') {
      const parts = String(node).split(/(\s+)/)
      return parts.map((part, i) => {
        if (!part) return null
        if (/^\s+$/.test(part)) return ' '
        const n = index++
        return (
          <span className="w" key={i}>
            <span style={{ '--i': n }}>{part}</span>
          </span>
        )
      })
    }
    if (Array.isArray(node))
      return node.map((child, i) => <Fragment key={i}>{split(child)}</Fragment>)
    if (isValidElement(node)) {
      const element = node
      if (element.type === Fragment) return <>{split(element.props.children)}</>
      if (element.props.children === void 0) return element
      return cloneElement(
        element,
        void 0,
        Children.map(element.props.children, split),
      )
    }
    return node
  }
  return <>{split(children)}</>
}
