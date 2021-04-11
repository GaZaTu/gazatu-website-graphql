import classNames from 'classnames'
import React from 'react'
import A from './A'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

export const useTagGroup = (props: GroupProps) => {
  const {
    size,
    hasAddons,
    children,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'tags': true,
    [`are-${size}`]: !!size,
    'has-addons': !!hasAddons,
  })

  return { ...nativeProps, children, className }
}

export const useTag = (props: Props) => {
  const {
    color,
    light,
    size,
    round,
    cross,
    tight,
    children,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'tag': true,
    [`is-${color}`]: !!color,
    'is-light': !!light,
    [`is-${size}`]: !!size,
    'is-rounded': !!round,
    'is-delete': !!cross,
    'is-tight': !cross && (tight ?? (children === undefined)),
  })

  return { ...nativeProps, children, className }
}

type GroupProps = HTMLProps<'div'> & {
  size?: 'normal' | 'medium' | 'large'
  hasAddons?: boolean
}

const Group: React.FC<GroupProps> = props => {
  const { className, children, innerRef, ...nativeProps } = useTagGroup(props)

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type SharedProps = {
  color?: Color
  light?: boolean
  size?: 'normal' | 'medium' | 'large'
  round?: boolean
  cross?: boolean
  tight?: boolean
}

type SpanProps = SharedProps & HTMLProps<'span', true> & {}

type AnchorProps = SharedProps & Omit<React.ComponentProps<typeof A>, 'as'> & {
  as: 'a'
}

type Props = SpanProps | AnchorProps

const Tag: React.FC<Props> = props => {
  const { className, children, ...nativeProps } = useTag(props)

  switch (nativeProps.as) {
    case undefined:
    case 'span':
      return (
        <span {...nativeProps} ref={nativeProps.innerRef} className={className}>
          {children}
        </span>
      )
    case 'a':
      return (
        <A {...nativeProps} innerRef={nativeProps.innerRef} className={className}>
          {children}
        </A>
      )
  }
}

export default Object.assign(React.memo(Tag), {
  Group,
})
