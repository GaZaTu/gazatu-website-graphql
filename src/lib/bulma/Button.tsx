import classNames from 'classnames'
import React from 'react'
import A from './A'
import Icon from './Icon'
import childMatches from './utils/childMatches'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type GroupProps = HTMLProps<'div'> & {
  hasAddons?: boolean
  align?: 'left' | 'right' | 'centered'
}

const Group: React.FC<GroupProps> = props => {
  const {
    hasAddons,
    align,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'buttons': true,
    'has-addons': !!hasAddons,
    [`is-${align}`]: !!align,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type SharedProps = {
  color?: Color
  light?: boolean
  size?: 'small' | 'normal' | 'medium' | 'large'
  display?: 'fullwidth'
  kind?: 'outlined' | 'inverted' | 'rounded'
  hovered?: boolean
  focused?: boolean
  active?: boolean
  loading?: boolean
  labelized?: boolean
  selected?: boolean
  cross?: boolean
}

function getButtonClassName<P extends (SharedProps & { children?: React.ReactNode, className?: string })>(props: P) {
  const {
    color,
    light,
    size,
    display,
    kind,
    hovered,
    focused,
    active,
    loading,
    labelized,
    selected,
    cross,
    ...nativeProps
  } = props

  let circular = false
  React.Children.forEach(nativeProps.children, (child, i) => {
    if (i === 0 && childMatches(child, [Icon], {})) {
      circular = true
    }
  })

  const className = classNames(nativeProps.className, {
    'button': true,
    [`is-${color}`]: !!color,
    'is-light': !!light,
    [`is-${size}`]: !!size,
    [`is-${display}`]: !!display,
    [`is-${kind}`]: !!kind,
    'is-hovered': !!hovered,
    'is-focused': !!focused,
    'is-active': !!active,
    'is-loading': !!loading,
    'is-static': !!labelized,
    'is-selected': !!selected,
    'is-circular': !!circular,
    'delete': !!cross,
  })

  return [className, nativeProps] as const
}

type ButtonProps = SharedProps & HTMLProps<'button', true> & {}

const InternalButton: React.FC<ButtonProps> = props => {
  const [className, { children, innerRef, ...nativeProps }] = getButtonClassName(props)

  return (
    <button {...nativeProps} ref={innerRef} className={className}>
      {children}
    </button>
  )
}

type AnchorProps = SharedProps & Omit<React.ComponentProps<typeof A>, 'as'> & {
  as: 'a'
}

const InternalAnchor: React.FC<AnchorProps> = props => {
  const [className, { children, innerRef, ...nativeProps }] = getButtonClassName(props)

  return (
    <A {...nativeProps} innerRef={innerRef} className={className}>
      {children}
    </A>
  )
}

type Props = ButtonProps | AnchorProps

const Button: React.FC<Props> = props => {
  switch (props.as) {
    case undefined:
    case 'button':
      return <InternalButton {...props} />
    case 'a':
      return <InternalAnchor {...props} />
  }
}

export default Object.assign(React.memo(Button), {
  Group,
})
