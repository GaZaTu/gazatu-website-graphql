import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'section'> & {
  size?: 'medium' | 'large'
}

const Section: React.FC<Props> = props => {
  const {
    size,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'section': true,
    [`is-${size}`]: !!size,
  })

  return (
    <section {...nativeProps} ref={innerRef} className={className}>
      {children}
    </section>
  )
}

export default React.memo(Section)
