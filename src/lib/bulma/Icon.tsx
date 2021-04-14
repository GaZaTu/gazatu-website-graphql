import classNames from 'classnames'
import React, { useContext } from 'react'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type InnerIconProps = {
  icon: any
  size?: 'lg' | '2x'
}

const Context = React.createContext({
  Icon: undefined as React.ComponentType<InnerIconProps> | undefined,
})

type Props = HTMLProps<'span'> & {
  color?: Color
  size?: 'small' | 'medium' | 'large'
  align?: 'left' | 'right'
  i?: string
  icon?: any
  iconSize?: any
}

const Icon: React.FC<Props> = props => {
  const {
    color,
    size,
    align,
    i,
    icon,
    iconSize,
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

  const { Icon: I } = useContext(Context)
  const getIconSize = () => {
    if (iconSize) {
      return iconSize
    }

    switch (size) {
      case 'small':
        return undefined
      case undefined:
      case 'medium':
        return 'lg'
      case 'large':
        return '2x'
    }
  }

  return (
    <span {...nativeProps} ref={innerRef} className={className}>
      {children}
      {i && (
        <i className={i} />
      )}
      {icon && I && (
        <I icon={icon} size={getIconSize()} />
      )}
    </span>
  )
}

export default Object.assign(React.memo(Icon), {
  Context,
})
