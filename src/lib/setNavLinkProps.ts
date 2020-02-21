import React from 'react'
import { navigate, getBasepath } from './hookrouter'
import { objectToQueryString } from './hookrouter/queryParams'

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  exact?: boolean
  activeClass?: string
  replace?: boolean
  queryParams?: any,
  replaceQueryParams?: boolean
  force?: boolean
}

const setNavLinkProps = (props: Props) => {
  const { exact, activeClass, replace, queryParams, replaceQueryParams, force, ...nativeProps } = props
  const onClick =
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        navigate(e.currentTarget.href, replace ?? false, queryParams ?? {}, replaceQueryParams ?? false, force ?? false)
      }

      if (props.onClick) {
        props.onClick(e)
      }
    }

  const href =
    props.href?.substr(0, 1) === '/'
      ? getBasepath() + props.href
      : props.href

  const active = (() => {
    if (exact) {
      return (window.location.pathname === href) && (window.location.search.slice(1) === objectToQueryString(queryParams ?? {}))
    } else {
      return window.location.pathname.startsWith(href || '')
    }
  })()

  const className = `${props.className || ''} ${active ? (activeClass || 'active') : ''}`

  return { ...nativeProps, href, onClick, className } as { href?: string, onClick?: () => any, className?: string }
}

export default setNavLinkProps
