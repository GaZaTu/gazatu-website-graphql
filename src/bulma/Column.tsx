import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type RowProps = HTMLProps<'div'> & {
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
  // gap?: boolean
  // gapMobile?: boolean
  // gapTablet?: boolean
  // gapDesktop?: boolean
  // gapWidescreen?: boolean
  // gapFullhd?: boolean
  gapless?: boolean
  multiline?: boolean
  vCentered?: boolean
  hCentered?: boolean
}

const Row: React.FC<RowProps> = props => {
  const {
    mobile,
    tablet,
    desktop,
    gapless,
    multiline,
    vCentered,
    hCentered,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'columns': true,
    'is-mobile': !!mobile,
    'is-desktop': !!desktop,
    'is-gapless': !!gapless,
    'is-multiline': !!multiline,
    'is-vcentered': !!vCentered,
    'is-centered': !!hCentered,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

type Props = HTMLProps<'div'> & {
  narrow?: boolean
  width?: number
  mobile?: number
  tablet?: number
  desktop?: number
  widescreen?: number
  fullhd?: number
}

const Column: React.FC<Props> = props => {
  const {
    narrow,
    width,
    mobile,
    tablet,
    desktop,
    widescreen,
    fullhd,
    children,
    innerRef,
    ...nativeProps
  } = props

  const mapSizeToClassName = (size?: number) => {
    switch (size) {
      case  1 /  1:
        return 'is-full'
      case  9 / 10:
        return 'is-9'
      case  4 /  5:
        return 'is-four-fifths'
      case  3 /  4:
        return 'is-three-quarters'
      case  7 / 10:
        return 'is-7'
      case  2 /  3:
        return 'is-two-thirds'
      case  3 /  5:
        return 'is-three-fifths'
      case  1 /  2:
        return 'is-half'
      case  2 /  5:
        return 'is-two-fifths'
      case  1 /  3:
        return 'is-one-third'
      case  3 / 10:
        return 'is-3'
      case  1 /  4:
        return 'is-one-quarter'
      case  1 /  5:
        return 'is-one-fifth'
      case  1 / 10:
        return 'is-1'
      default:
        return ''
    }
  }

  const mapSizeAndViewportToClassName = (size?: number, viewport?: 'mobile' | 'tablet' | 'desktop' | 'widescreen' | 'fullhd') => {
    return `${mapSizeToClassName(size)}${viewport ? `-${viewport}` : ``}`
  }

  const className = classNames(nativeProps.className, {
    'column': true,
    'is-narrow': !!narrow,
    [mapSizeAndViewportToClassName(width, undefined)]: !!width,
    [mapSizeAndViewportToClassName(mobile, 'mobile')]: !!mobile,
    [mapSizeAndViewportToClassName(tablet, 'tablet')]: !!tablet,
    [mapSizeAndViewportToClassName(desktop, 'desktop')]: !!desktop,
    [mapSizeAndViewportToClassName(widescreen, 'widescreen')]: !!widescreen,
    [mapSizeAndViewportToClassName(fullhd, 'fullhd')]: !!fullhd,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default Object.assign(React.memo(Column), {
  Row,
})
