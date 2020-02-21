import React from 'react'
import { Link } from '@material-ui/core'
import setNavLinkProps from '../setNavLinkProps'
import { useQueryParams } from '../hookrouter'

interface Props extends React.ComponentProps<typeof Link> {
  exact?: boolean
  activeClass?: string
  replace?: boolean
  queryParams?: any,
  replaceQueryParams?: boolean
  force?: boolean
}

const NavLink: React.FC<Props> = (props, ref) => {
  const { href, onClick, className, exact, activeClass, replace, queryParams, replaceQueryParams, force, ...linkProps } = props
  const navLinkProps = { href, onClick, className, exact, activeClass, replace, queryParams, replaceQueryParams, force }

  useQueryParams()

  return (
    <Link ref={ref} {...linkProps} {...setNavLinkProps(navLinkProps)}>
      {props.children}
    </Link>
  )
}

export default React.memo(React.forwardRef(NavLink))
