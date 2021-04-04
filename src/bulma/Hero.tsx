import classNames from 'classnames'
import React from 'react'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type HeadProps = HTMLProps<'div'> & {}

const Head: React.FC<HeadProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'hero-head': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type BodyProps = HTMLProps<'div'> & {}

const Body: React.FC<BodyProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'hero-body': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type FootProps = HTMLProps<'div'> & {}

const Foot: React.FC<FootProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'hero-foot': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type Props = HTMLProps<'section'> & {
  size?: 'small' | 'medium' | 'large' | 'halfheight' | 'fullheight' | 'fullheight-with-navbar'
  color?: Color
}

const Hero: React.FC<Props> = props => {
  const {
    size,
    color,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'hero': true,
    [`is-${size}`]: !!size,
    [`is-${color}`]: !!color,
  })

  return (
    <section {...nativeProps} ref={innerRef} className={className}>
      {children}
    </section>
  )
}

export default Object.assign(React.memo(Hero), {
  Head,
  Body,
  Foot,
})
