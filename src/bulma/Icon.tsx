import classNames from 'classnames'
import React from 'react'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'span'> & {
  color?: Color
  size?: 'small' | 'medium' | 'large'
  align?: 'left' | 'right'
  i?: string
}

const Icon: React.FC<Props> = props => {
  const {
    color,
    size,
    align,
    i,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'icon': true,
    [`has-text-${color}`]: !!color,
    [`is-${size}`]: !!size,
    [`is-${align}`]: !!align,
  })

  return (
    <span {...nativeProps} ref={innerRef} className={className}>
      {children}
      {i && (
        <i className={i} />
      )}
    </span>
  )
}

export default React.memo(Icon)
