import classNames from 'classnames'
import React, { useContext, useMemo } from 'react'
import { HTMLProps } from './utils/HTMLProps'

type UseLocation = () => {
  pathname: string
  search: string
} | undefined

type UseHistory = () => {
  push: (path: string) => void
  replace: (path: string) => void
} | undefined

type UseRouteMatch = (route: { path: string }) => {
  path: string
  isExact: boolean
} | undefined

const Context = React.createContext({
  useLocation: (() => undefined) as UseLocation,
  useHistory: (() => undefined) as UseHistory,
  useRouteMatch: (() => undefined) as UseRouteMatch,
})

type Props = HTMLProps<'a'> & {
  params?: Record<string, any>
  replace?: boolean
  active?: boolean
  activeClass?: string
  exact?: boolean
  exactParams?: boolean
  external?: boolean
}

const A: React.FC<Props> = props => {
  const {
    params,
    replace,
    active,
    activeClass = 'is-active',
    exact,
    exactParams,
    external,
    children,
    innerRef,
    ...nativeProps
  } = props

  if (external) {
    nativeProps.target = '_blank'
    nativeProps.rel = 'noopener noreferrer'
  }

  const nativeHref = nativeProps.href
  const [href, path, query] = useMemo(() => {
    if (!nativeHref) {
      return [undefined, undefined, ''] as const
    }

    if (!params) {
      return [nativeHref, nativeHref, '']
    }

    const query = new URLSearchParams(params).toString()

    if (!query) {
      return [nativeHref, nativeHref, ''] as const
    }

    return [`${nativeHref}?${query}`, nativeHref, query] as const
  }, [nativeHref, params])

  const { useLocation, useHistory, useRouteMatch } = useContext(Context)

  const history = useHistory()
  if (history && href) {
    nativeProps.onClick = e => {
      if (external) {
        return
      }

      e.preventDefault()

      if (replace) {
        history.replace(href)
      } else {
        history.push(href)
      }
    }
  }

  const location = useLocation()
  const match = useRouteMatch({ path: path ?? '' })
  const matchActive = (() => {
    if (!match || !match.path || (match.isExact === !exact)) {
      return false
    }

    if (exactParams) {
      if (query !== location?.search?.slice(1)) {
        return false
      }
    }

    return true
  })()

  const className = classNames(nativeProps.className, {
    [activeClass]: active ?? matchActive,
  })

  return (
    <a {...nativeProps} ref={innerRef} className={className} href={href}>
      {children ?? nativeHref}
    </a>
  )
}

export default Object.assign(React.memo(A), {
  Context,
})
