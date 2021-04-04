import classNames from 'classnames'
import React, { useContext, useMemo, useRef, useState } from 'react'
import A from './A'
import { HTMLProps } from './utils/HTMLProps'
import useOutsideRefClickEffect from './utils/useOutsideRefClickEffect'

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

type AnchorItemProps = React.ComponentProps<typeof A> & {}

type DivItemProps = HTMLProps<'div', false> & {}

type ItemProps = AnchorItemProps | DivItemProps

const Item: React.FC<ItemProps> = props => {
  const {
    children,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'dropdown-item': true,
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
}

const Dropdown: React.FC<Props> = props => {
  const {
    disabled,
    hoverable,
    active: forceActive,
    narrow,
    right,
    up,
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
    'is-active': !!active,
    'is-narrow': !!narrow,
    'is-right': !!right,
    'is-up': !!up,
  })

  const context = useMemo(() => {
    return { activeState, setActiveState }
  }, [activeState, setActiveState])

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Context.Provider value={context}>
        {children}
      </Context.Provider>
    </div>
  )
}

export default Object.assign(React.memo(Dropdown), {
  Context,
  Trigger,
  Menu,
  Item,
  Divider,
})
