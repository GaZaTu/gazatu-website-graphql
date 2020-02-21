import React from 'react'
import { Link } from '@material-ui/core'
import setNavLinkProps from '../setNavLinkProps'

interface Props extends React.ComponentProps<typeof Link> {
  exact?: boolean
  activeClass?: string
  replace?: boolean
  queryParams?: any,
  replaceQueryParams?: boolean
  force?: boolean
}

class NavLink extends React.PureComponent<Props> {
  render() {
    const { href, onClick, className, exact, activeClass, replace, queryParams, replaceQueryParams, force, ...linkProps } = this.props
    const navLinkProps = { href, onClick, className, exact, activeClass, replace, queryParams, replaceQueryParams, force }

    return (
      <Link {...linkProps} {...setNavLinkProps(navLinkProps)}>
        {this.props.children}
      </Link>
    )
  }
}

export default NavLink
