import classNames from 'classnames'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import A from './A'
import { Color } from './utils/classes'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'

const Context = React.createContext({
  menuActive: false,
  setMenuActive: (menuActive: boolean) => {},
})

type BrandProps = HTMLProps<'div'> & {
  addBurger?: boolean
}

const Brand: React.FC<BrandProps> = props => {
  const {
    addBurger,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-brand': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
      {addBurger && (
        <Burger />
      )}
    </div>
  )
}

type BurgerProps = HTMLProps<'a'> & {
  active?: boolean
}

const Burger: React.FC<BurgerProps> = props => {
  const { menuActive, setMenuActive } = useContext(Context)

  const { useLocation } = useContext(A.Context)
  const location = useLocation()
  useEffect(() => {
    if (!location) {
      return
    }

    setMenuActive(false)
  }, [setMenuActive, location])

  const {
    active = menuActive,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-burger': true,
    'is-active': !!active,
  })

  return (
    <a {...nativeProps} ref={innerRef} className={className} role="button" onClick={() => setMenuActive(!menuActive)}>
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </a>
  )
}

type MenuProps = HTMLProps<'div'> & {
  active?: boolean
}

const Menu: React.FC<MenuProps> = props => {
  const { menuActive } = useContext(Context)

  const {
    active = menuActive,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-menu': true,
    'is-active': !!active,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type StartProps = HTMLProps<'div'> & {}

const Start: React.FC<StartProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-start': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type EndProps = HTMLProps<'div'> & {}

const End: React.FC<EndProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-end': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type ShredItemProps = {
  label?: React.ReactNode
  expanded?: boolean
  tab?: boolean
  active?: boolean
}

type AnchorItemProps = ShredItemProps & React.ComponentProps<typeof A> & {
  exact?: boolean
}

const AnchorItem: React.FC<AnchorItemProps> = props => {
  const {
    label,
    expanded,
    tab,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-item': true,
    'is-expanded': !!expanded,
    'is-tab': !!tab,
  })

  return (
    <A {...nativeProps} innerRef={innerRef} className={className}>
      {label}
      {children}
    </A>
  )
}

type DivItemProps = ShredItemProps & HTMLProps<'div', false> & {
  linkProps?: HTMLProps<'a'>
  menuProps?: HTMLProps<'div'>
  dropdown?: boolean
  dropdownActive?: boolean
  hoverable?: boolean
  right?: boolean
  up?: boolean
  arrowless?: boolean
  boxed?: boolean
  href?: string
}

const DivItem: React.FC<DivItemProps> = props => {
  const hasItemChildren = !!getChildrenByTypeAndProps(props.children, [Item], {}).length
  const [activeState, setActiveState] = useState(false)

  const {
    label,
    expanded,
    tab,
    active,
    linkProps,
    menuProps,
    dropdown = hasItemChildren,
    dropdownActive = activeState,
    hoverable,
    right,
    up,
    arrowless,
    boxed,
    href,
    children,
    innerRef,
    ...nativeProps
  } = props

  const { useRouteMatch } = useContext(A.Context)
  const match = useRouteMatch({ path: href ?? '' })

  const className = classNames(nativeProps.className, {
    'navbar-item': true,
    'is-expanded': !!expanded,
    'is-tab': !!tab,
    'has-dropdown': !!dropdown,
    'is-hoverable': !!hoverable,
    'is-active': !!dropdownActive,
    'is-right': !!right,
    'has-dropdown-up': !!up,
    'is-boxed': !!boxed,
  })

  const linkClassName = classNames(linkProps?.className, {
    'navbar-link': true,
    'is-arrowless': !!arrowless,
    'is-active': active ?? !!match?.path,
  })

  const dropdownClassName = classNames(menuProps?.className, {
    'navbar-dropdown': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {dropdown && (
        <React.Fragment>
          <a onClick={!hoverable ? (() => setActiveState(a => !a)) : undefined} {...linkProps} className={linkClassName}>
            {label}
          </a>
          <div {...menuProps} className={dropdownClassName}>
            {children}
          </div>
        </React.Fragment>
      )}
      {!dropdown && (
        <React.Fragment>
          {label}
          {children}
        </React.Fragment>
      )}
    </div>
  )
}

type ItemProps = AnchorItemProps | DivItemProps

const Item: React.FC<ItemProps> = props => {
  switch (props.as) {
    case undefined:
    case 'a':
      return <AnchorItem {...props} />
    case 'div':
      return <DivItem {...props} />
  }
}

type DividerProps = HTMLProps<'hr'> & {}

const Divider: React.FC<DividerProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar-divider': true,
  })

  return (
    <hr {...nativeProps} ref={innerRef} className={className}>
      {children}
    </hr>
  )
}

type Props = HTMLProps<'nav'> & {
  transparent?: boolean
  fixed?: 'top' | 'bottom'
  color?: Color
  spaced?: boolean
  shadow?: boolean
  padded?: boolean
}

const Navbar: React.FC<Props> = props => {
  const {
    transparent,
    fixed,
    color,
    spaced,
    shadow,
    padded,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'navbar': true,
    'is-transparent': !!transparent,
    [`is-${color}`]: !!color,
    'is-spaced': !!spaced,
    'has-shadow': !!shadow,
    'is-padded': !!padded,
  })

  useLayoutEffect(() => {
    if (!fixed) {
      return
    }

    const cls = `has-navbar-fixed-${fixed}`

    document.body.classList.add(cls)

    return () => {
      document.body.classList.remove(cls)
    }
  }, [fixed])

  const [menuActive, setMenuActive] = useState(false)

  return (
    <nav {...nativeProps} ref={innerRef} className={className} role="navigation">
      <Context.Provider value={{ menuActive, setMenuActive }}>
        {children}
      </Context.Provider>
    </nav>
  )
}

export default Object.assign(React.memo(Navbar), {
  Context,
  Brand,
  Burger,
  Menu,
  Start,
  End,
  Item,
  Divider,
})
