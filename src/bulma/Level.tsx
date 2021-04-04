import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type LeftProps = HTMLProps<'div'> & {}

const Left: React.FC<LeftProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'level-left': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type RightProps = HTMLProps<'div'> & {}

const Right: React.FC<RightProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'level-right': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type ItemProps = HTMLProps<'div'> & {
  hasTextCentered?: boolean
}

const Item: React.FC<ItemProps> = props => {
  const {
    hasTextCentered,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'level-item': true,
    'has-text-centered': !!hasTextCentered,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type Props = HTMLProps<'nav'> & {
  mobile?: boolean
}

const Level: React.FC<Props> = props => {
  const {
    mobile,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'level': true,
    'is-mobile': !!mobile,
  })

  return (
    <nav {...nativeProps} ref={innerRef} className={className}>
      {children}
    </nav>
  )
}

export default Object.assign(React.memo(Level), {
  Left,
  Right,
  Item,
})
