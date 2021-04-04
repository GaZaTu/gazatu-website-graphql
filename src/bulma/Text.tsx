import classNames from 'classnames'
import React from 'react'
import Icon from './Icon'
import { Color } from './utils/classes'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'
import useDocumentTitle from './utils/useDocumentTitle'

const _P: React.FC<Omit<ParagraphProps, 'as'>> = props => (
  <Text as="p" {...props} />
)

const _Div: React.FC<Omit<DivProps, 'as'>> = props => (
  <Text as="div" {...props} />
)

const _Span: React.FC<Omit<SpanProps, 'as'>> = props => (
  <Text as="span" {...props} />
)

const _H1: React.FC<Omit<Header1Props, 'as'>> = props => (
  <Text as="h1" {...props} />
)

const _H2: React.FC<Omit<Header2Props, 'as'>> = props => (
  <Text as="h2" {...props} />
)

const _H3: React.FC<Omit<Header3Props, 'as'>> = props => (
  <Text as="h3" {...props} />
)

const _H4: React.FC<Omit<Header4Props, 'as'>> = props => (
  <Text as="h4" {...props} />
)

const _H5: React.FC<Omit<Header5Props, 'as'>> = props => (
  <Text as="h5" {...props} />
)

const _H6: React.FC<Omit<Header6Props, 'as'>> = props => (
  <Text as="h6" {...props} />
)

export const P = React.memo(_P)
export const Div = React.memo(_Div)
export const Span = React.memo(_Span)
export const H1 = React.memo(_H1)
export const H2 = React.memo(_H2)
export const H3 = React.memo(_H3)
export const H4 = React.memo(_H4)
export const H5 = React.memo(_H5)
export const H6 = React.memo(_H6)

type SharedProps = {
  kind?: 'title' | 'subtitle'
  size?: 1 | 2 | 3 | 4 | 5 | 6
  color?: Color
  spaced?: boolean
  documentTitle?: boolean | string
}

type ParagraphProps = SharedProps & HTMLProps<'p', false> & {}

type DivProps = SharedProps & HTMLProps<'div', false> & {}

type SpanProps = SharedProps & HTMLProps<'span', false> & {}

type Header1Props = SharedProps & HTMLProps<'h1', false> & {}

type Header2Props = SharedProps & HTMLProps<'h2', false> & {}

type Header3Props = SharedProps & HTMLProps<'h3', false> & {}

type Header4Props = SharedProps & HTMLProps<'h4', false> & {}

type Header5Props = SharedProps & HTMLProps<'h5', false> & {}

type Header6Props = SharedProps & HTMLProps<'h6', false> & {}

type Props = ParagraphProps | DivProps | SpanProps | Header1Props | Header2Props | Header3Props | Header4Props | Header5Props | Header6Props

const Text: React.FC<Props> = props => {
  const {
    as,
    kind,
    size,
    color,
    spaced,
    documentTitle,
    innerRef,
    ...nativeProps
  } = props

  const hasIcons = !!getChildrenByTypeAndProps(nativeProps.children, [Icon], {}).length

  const className = classNames(nativeProps.className, {
    [`${kind}`]: !!kind,
    [`is-${size}`]: !!size,
    [`has-text-${color}`]: !!color,
    'is-spaced': !!spaced,
    'icon-text': !!hasIcons,
  })

  let childString = ''

  const children = React.Children.map(nativeProps.children, child => {
    if (typeof child === 'string') {
      childString = child

      return React.createElement('span', {}, child)
    }

    return child
  })

  useDocumentTitle(typeof documentTitle === 'string' ? documentTitle : childString, !documentTitle || !childString)

  return React.createElement(as, { ...nativeProps, ref: innerRef, className }, children)
}

export default React.memo(Text)
