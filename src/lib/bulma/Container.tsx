import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'div'> & {
  widescreen?: boolean
  fullhd?: boolean
  maxDesktop?: boolean
  maxWidescreen?: boolean
  fluid?: boolean
}

const Container: React.FC<Props> = props => {
  const {
    widescreen,
    fullhd,
    maxDesktop,
    maxWidescreen,
    fluid,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'container': true,
    'is-widescreen': !!widescreen,
    'is-fullhd': !!fullhd,
    'is-max-desktop': !!maxDesktop,
    'is-max-widescreen': !!maxWidescreen,
    'is-fluid': !!fluid,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default React.memo(Container)
