import classNames from 'classnames'
import React, { useContext, useMemo, useState } from 'react'
import A from './A'
import Image from './Image'
import { HTMLProps } from './utils/HTMLProps'

const Context = React.createContext({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => {},
})

type CardHeaderProps = HTMLProps<'header'> & {
  title?: React.ReactNode
  Icon?: React.JSXElementConstructor<{ collapsed: boolean }>
  onIconClick?: (event: React.MouseEvent) => void
}

const CardHeader: React.FC<CardHeaderProps> = props => {
  const {
    title,
    Icon,
    onIconClick,
    children,
    innerRef,
    ...nativeProps
  } = props

  const { collapsed } = useContext(Context)

  const className = classNames(nativeProps.className, {
    'card-header': true,
  })

  return (
    <header {...nativeProps} ref={innerRef} className={className}>
      {title && (
        <CardHeaderTitle>{title}</CardHeaderTitle>
      )}
      {Icon && (
        <CardHeaderIcon onClick={onIconClick}>
          <Icon collapsed={collapsed} />
        </CardHeaderIcon>
      )}
      {children}
    </header>
  )
}

type CardHeaderTitleProps = HTMLProps<'p'> & {}

const CardHeaderTitle: React.FC<CardHeaderTitleProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'card-header-title': true,
  })

  return (
    <p {...nativeProps} ref={innerRef} className={className}>
      {children}
    </p>
  )
}

type CardHeaderIconProps = HTMLProps<'button'> & {}

const CardHeaderIcon: React.FC<CardHeaderIconProps> = props => {
  const {
    onClick,
    children,
    innerRef,
    ...nativeProps
  } = props

  const { collapsed, setCollapsed } = useContext(Context)
  const toggleCollapsed = useMemo(() => {
    return () =>
      setCollapsed(!collapsed)
  }, [collapsed, setCollapsed])

  const className = classNames(nativeProps.className, {
    'card-header-icon': true,
  })

  return (
    <button {...nativeProps} ref={innerRef} className={className} onClick={onClick ?? toggleCollapsed}>
      {children}
    </button>
  )
}

type CardImageProps = React.ComponentProps<typeof Image> & {
  visibleIfCollapsed?: boolean
}

const CardImage: React.FC<CardImageProps> = props => {
  const {
    visibleIfCollapsed,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames({
    'card-image': true,
    'is-visible-if-collapsed': visibleIfCollapsed,
  })

  return (
    <div className={className}>
      <Image {...nativeProps} innerRef={innerRef} />
    </div>
  )
}

type CardContentProps = HTMLProps<'div'> & {
  visibleIfCollapsed?: boolean
}

const CardContent: React.FC<CardContentProps> = props => {
  const {
    visibleIfCollapsed,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'card-content': true,
    'is-visible-if-collapsed': visibleIfCollapsed,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type CardFooterProps = HTMLProps<'div'> & {
  visibleIfCollapsed?: boolean
}

const CardFooter: React.FC<CardFooterProps> = props => {
  const {
    visibleIfCollapsed,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'card-footer': true,
    'is-visible-if-collapsed': visibleIfCollapsed,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type CardFooterItemProps = React.ComponentProps<typeof A> & {}

const CardFooterItem: React.FC<CardFooterItemProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'card-footer-item': true,
  })

  return (
    <A {...nativeProps} innerRef={innerRef} className={className}>
      {children}
    </A>
  )
}

type Props = HTMLProps<'div'> & {
  collapsed?: boolean
}

const Card: React.FC<Props> = props => {
  const {
    collapsed: _collapsed,
    children,
    innerRef,
    ...nativeProps
  } = props

  const [collapsed, setCollapsed] = useState(false)
  const isCollapsed = _collapsed || collapsed

  const className = classNames(nativeProps.className, {
    'card': true,
    'is-collapsed': isCollapsed,
  })

  return (
    <Context.Provider value={{ collapsed: isCollapsed, setCollapsed }}>
      <div {...nativeProps} ref={innerRef} className={className}>
        {children}
      </div>
    </Context.Provider>
  )
}

export default Object.assign(React.memo(Card), {
  Context,
  Header: Object.assign(CardHeader, {
    Title: CardHeaderTitle,
    Icon: CardHeaderIcon,
  }),
  Image: CardImage,
  Content: CardContent,
  Footer: Object.assign(CardFooter, {
    Item: CardFooterItem,
  }),
})
