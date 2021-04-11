import classNames from 'classnames'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import A from './A'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'
import useOutsideRefClickEffect from './utils/useOutsideRefClickEffect'
import useRefProxy from './utils/useRefProxy'

const Portal = React.createContext({
  createDropdownPortal: (menu: React.ReactNode) => undefined as React.ReactPortal | undefined,
})
const PortalProvider = Portal.Provider

const Provider: React.FC<{}> = props => {
  const { children } = props
  const ref = useRef<HTMLDivElement>(null)

  const createDropdownPortal = useMemo(() => {
    return (menu: React.ReactNode) => {
      if (!ref.current) {
        return
      }

      return createPortal(menu, ref.current)
    }
  }, [])

  return (
    <PortalProvider value={{ createDropdownPortal }}>
      {children}
      <div className="dropdowns" ref={ref} />
    </PortalProvider>
  )
}

const Context = React.createContext({
  activeState: false,
  setActiveState: (activeState: boolean) => {},
})

type TriggerProps = HTMLProps<'div'> & {}

const Trigger: React.FC<TriggerProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'dropdown-trigger': true,
  })

  const { setActiveState } = useContext(Context)
  const setActiveTrue = useMemo(() => {
    return () => {
      setActiveState(true)
    }
  }, [setActiveState])

  return (
    <div onClick={setActiveTrue} {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type MenuProps = HTMLProps<'div'> & {}

const Menu: React.FC<MenuProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'dropdown-menu': true,
  })

  const { activeState, setActiveState } = useContext(Context)
  const setActiveFalse = useMemo(() => {
    return () => {
      setActiveState(false)
    }
  }, [setActiveState])

  const innerRefDefault = useRef<HTMLDivElement>(null)
  useOutsideRefClickEffect(setActiveFalse, innerRefDefault, activeState)

  return (
    <div {...nativeProps} ref={innerRef ?? innerRefDefault} className={className} role="menu">
      <div className="dropdown-content">
        {children}
      </div>
    </div>
  )
}

type SharedItemProps = {
  active?: boolean
}

type AnchorItemProps = SharedItemProps & React.ComponentProps<typeof A> & {}

type DivItemProps = SharedItemProps & HTMLProps<'div', false> & {}

type ItemProps = AnchorItemProps | DivItemProps

const Item: React.FC<ItemProps> = props => {
  const {
    active,
    children,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'dropdown-item': true,
    'is-active': !!active,
  })

  switch (nativeProps.as) {
    case undefined:
    case 'a':
      return (
        <A {...nativeProps} innerRef={nativeProps.innerRef} className={className}>
          {children}
        </A>
      )
    case 'div':
      return (
        <div {...nativeProps} ref={nativeProps.innerRef} className={className}>
          {children}
        </div>
      )
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
    'dropdown-divider': true,
  })

  return (
    <hr {...nativeProps} ref={innerRef} className={className}>
      {children}
    </hr>
  )
}

type Props = HTMLProps<'div'> & {
  disabled?: boolean
  hoverable?: boolean
  active?: boolean
  narrow?: boolean
  right?: boolean
  up?: boolean
  hasMaxWidth100Percent?: boolean
  hasMaxHeight300px?: boolean
  usePortal?: boolean
}

const Dropdown: React.FC<Props> = props => {
  const {
    disabled,
    hoverable,
    active: forceActive,
    narrow,
    right,
    up,
    hasMaxWidth100Percent,
    hasMaxHeight300px,
    usePortal,
    children,
    innerRef,
    ...nativeProps
  } = props

  const [activeState, _setActiveState] = useState(false)
  const setActiveState = useMemo(() => {
    return (activeState: boolean) => {
      _setActiveState(activeState && !disabled)
    }
  }, [_setActiveState, disabled])
  const active = (forceActive || activeState) && !disabled

  const className = classNames(nativeProps.className, {
    'dropdown': true,
    'is-hoverable': !!hoverable,
    'is-active': !!active && !usePortal,
    'is-narrow': !!narrow,
    'is-right': !!right,
    'is-up': !!up,
    'has-max-width-100percent': !!hasMaxWidth100Percent,
    'has-max-height-300px': !!hasMaxHeight300px,
  })

  const context = useMemo(() => {
    return { activeState, setActiveState }
  }, [activeState, setActiveState])

  const normalDropdownRef = useRefProxy<HTMLDivElement>(null, innerRef)
  const portalDropdownRef = useRef<HTMLDivElement>(null)

  const { createDropdownPortal } = useContext(Portal)
  const trigger = getChildrenByTypeAndProps(children, [Trigger], {})[0]
  const menu = getChildrenByTypeAndProps(children, [Menu], {})[0]

  useOutsideRefClickEffect(() => {
    if (!usePortal) {
      return
    }

    setActiveState(false)
  }, portalDropdownRef, usePortal && active)

  const getElementScreenCoordinates = (elem: HTMLElement | null) => {
    if (!elem) {
      return {}
    }

    const { top, left, width } = elem.getBoundingClientRect()
    return { top, left, width }
  }

  return (
    <div {...nativeProps} ref={normalDropdownRef} className={className}>
      <Context.Provider value={context}>
        {!usePortal && children}
        {usePortal && (
          <React.Fragment>
            {trigger}
            {createDropdownPortal(
              <Dropdown innerRef={portalDropdownRef} style={getElementScreenCoordinates(normalDropdownRef.current)} active={active} right={right} up={up} hasMaxWidth100Percent={hasMaxWidth100Percent} hasMaxHeight300px={hasMaxHeight300px}>
                <Context.Provider value={context}>
                  {menu}
                </Context.Provider>
              </Dropdown>
            )}
          </React.Fragment>
        )}
      </Context.Provider>
    </div>
  )
}

export default Object.assign(React.memo(Dropdown), {
  Portal: Object.assign(Portal, {
    Provider,
  }),
  Context,
  Trigger,
  Menu,
  Item,
  Divider,
})
