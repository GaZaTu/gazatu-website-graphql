import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'div'> & {
  size?: 'small' | 'medium' | 'large'
}

const Content: React.FC<Props> = props => {
  const {
    size,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'content': true,
    [`is-${size}`]: !!size,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default React.memo(Content)
