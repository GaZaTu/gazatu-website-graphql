import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'div'> & {}

const Box: React.FC<Props> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'box': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default React.memo(Box)
