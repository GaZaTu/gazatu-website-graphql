import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type CaptionProps = HTMLProps<'figcaption'> & {}

const Caption: React.FC<CaptionProps> = props => {
  const {
    innerRef,
    children,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'image-caption': true,
  })

  return (
    <figcaption {...nativeProps} ref={innerRef} className={className}>
      {children}
    </figcaption>
  )
}

type Props = HTMLProps<'figure'> & {
  ratio?: number
  dimension?: '16x16' | '24x24' | '32x32' | '48x48' | '64x64' | '96x96' | '128x128'
  caption?: string
}

const Image: React.FC<Props> = props => {
  const {
    ratio,
    dimension,
    caption,
    innerRef,
    ...nativeProps
  } = props

  const mapRatioToClassName = (ratio?: number) => {
    switch (ratio) {
      case  1 /  1:
        return 'is-1by1'
      case  5 /  4:
        return 'is-5by4'
      case  4 /  3:
        return 'is-4by3'
      case  3 /  2:
        return 'is-3by2'
      case  5 /  3:
        return 'is-5by3'
      case 16 /  9:
        return 'is-16by9'
      case  2 /  1:
        return 'is-2by1'
      case  3 /  1:
        return 'is-3by1'
      case  4 /  5:
        return 'is-4by5'
      case  3 /  4:
        return 'is-3by4'
      case  2 /  3:
        return 'is-2by3'
      case  3 /  5:
        return 'is-3by5'
      case  9 / 16:
        return 'is-9by16'
      case  1 /  2:
        return 'is-1by2'
      case  1 /  3:
        return 'is-1by3'
      default:
        return ''
    }
  }

  const className = classNames(nativeProps.className, {
    'image': true,
    [mapRatioToClassName(ratio)]: !!ratio,
    [`is-${dimension}`]: !!dimension,
  })

  const children = React.Children.map(nativeProps.children, (child: any) => {
    if (!child) {
      return undefined
    }

    if (typeof child === 'object' && child.type !== 'img' && child.props) {
      return React.cloneElement(child, { className: classNames(child.props.className, 'has-ratio') })
    }

    return child
  })

  return (
    <figure {...nativeProps} ref={innerRef} className={className}>
      {children && caption && (
        <Caption>{caption}</Caption>
      )}
      {children}
    </figure>
  )
}

export default Object.assign(React.memo(Image), {
  Caption,
})
