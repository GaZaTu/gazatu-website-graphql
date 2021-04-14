import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type LeftProps = HTMLProps<'figure'> & {}

const Left: React.FC<LeftProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'media-left': true,
  })

  return (
    <figure {...nativeProps} ref={innerRef} className={className}>
      {children}
    </figure>
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
    'media-right': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type ContentProps = HTMLProps<'div'> & {}

const Content: React.FC<ContentProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'media-content': true,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type Props = HTMLProps<'article'> & {}

const Media: React.FC<Props> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'media': true,
  })

  return (
    <article {...nativeProps} ref={innerRef} className={className}>
      {children}
    </article>
  )
}

export default Object.assign(React.memo(Media), {
  Left,
  Right,
  Content,
})
