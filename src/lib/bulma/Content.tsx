import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'div'> & {
  size?: 'small' | 'medium' | 'large'
  fullscreen?: boolean
}

const Content: React.FC<Props> = props => {
  const {
    size,
    fullscreen,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'content': true,
    [`is-${size}`]: !!size,
    'is-fullscreen': fullscreen,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default React.memo(Content)
