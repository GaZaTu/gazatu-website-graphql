import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'figure'> & {
  ratio?: number
}

const Image: React.FC<Props> = props => {
  const {
    ratio,
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
  })

  const children = React.Children.map(nativeProps.children, (child: any) => {
    if (typeof child === 'object' && child.type !== 'img' && child.props) {
      return React.cloneElement(child, { className: classNames(child.props.className, 'has-ratio') })
    }

    return child
  })

  return (
    <figure {...nativeProps} ref={innerRef} className={className}>
      {children}
    </figure>
  )
}

export default React.memo(Image)
