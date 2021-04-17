import classNames from 'classnames'
import React, { useContext } from 'react'
import A from './A'
import Icon from './Icon'
import { Color } from './utils/classes'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'
import useDocumentTitleEffect from './utils/useDocumentTitleEffect'

export const textIcons = {
  faLink: undefined as any,
}

const defaultDateFormat = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const LinkifyBulmaADecorator: InnerLinkifyProps['componentDecorator'] = (decoratedHref, decoratedText, key) => {
  return (
    <A key={key} href={decoratedHref}>
      {decoratedText}
    </A>
  )
}

type InnerLinkifyProps = {
  children: React.ReactNode
  componentDecorator?: (decoratedHref: string, decoratedText: string, key: number) => React.ReactNode
}

const Context = React.createContext({
  Linkify: undefined as React.ComponentType<InnerLinkifyProps> | undefined,
})

const _P: React.FC<Omit<ParagraphProps, 'as'>> = props => (
  <Text as="p" {...props} />
)

const _Div: React.FC<Omit<DivProps, 'as'>> = props => (
  <Text as="div" {...props} />
)

const _Span: React.FC<Omit<SpanProps, 'as'>> = props => (
  <Text as="span" {...props} />
)

const _Pre: React.FC<Omit<PreProps, 'as'>> = props => (
  <Text as="pre" {...props} />
)

const _H1: React.FC<Omit<Header1Props, 'as'>> = props => (
  <Text as="h1" size={1} {...props} />
)

const _H2: React.FC<Omit<Header2Props, 'as'>> = props => (
  <Text as="h2" size={2} {...props} />
)

const _H3: React.FC<Omit<Header3Props, 'as'>> = props => (
  <Text as="h3" size={3} {...props} />
)

const _H4: React.FC<Omit<Header4Props, 'as'>> = props => (
  <Text as="h4" size={4} {...props} />
)

const _H5: React.FC<Omit<Header5Props, 'as'>> = props => (
  <Text as="h5" size={5} {...props} />
)

const _H6: React.FC<Omit<Header6Props, 'as'>> = props => (
  <Text as="h6" size={6} {...props} />
)

export const P = React.memo(_P)
export const Div = React.memo(_Div)
export const Span = React.memo(_Span)
export const Pre = React.memo(_Pre)
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
  date?: number | string | Date
  dateFormat?: Intl.DateTimeFormat
  caps?: boolean
  hashLink?: boolean
  linkify?: boolean
}

type ParagraphProps = SharedProps & HTMLProps<'p', false> & {}

type DivProps = SharedProps & HTMLProps<'div', false> & {}

type SpanProps = SharedProps & HTMLProps<'span', false> & {}

type PreProps = SharedProps & HTMLProps<'pre', false> & {}

type Header1Props = SharedProps & HTMLProps<'h1', false> & {}

type Header2Props = SharedProps & HTMLProps<'h2', false> & {}

type Header3Props = SharedProps & HTMLProps<'h3', false> & {}

type Header4Props = SharedProps & HTMLProps<'h4', false> & {}

type Header5Props = SharedProps & HTMLProps<'h5', false> & {}

type Header6Props = SharedProps & HTMLProps<'h6', false> & {}

type Props = ParagraphProps | DivProps | SpanProps | PreProps | Header1Props | Header2Props | Header3Props | Header4Props | Header5Props | Header6Props

const Text: React.FC<Props> = props => {
  const {
    as: Element,
    kind,
    size,
    color,
    spaced,
    documentTitle: _documentTitle,
    date,
    dateFormat = defaultDateFormat,
    caps,
    hashLink,
    linkify,
    innerRef,
    ...nativeProps
  } = props

  const hasIcons = !!getChildrenByTypeAndProps(nativeProps.children, [Icon], {}).length

  const className = classNames(nativeProps.className, {
    [`${kind}`]: !!kind,
    [`is-size-${size}`]: !kind && !!size,
    [`has-text-${color}`]: !!color,
    'is-spaced': !!spaced,
    'icon-text': !!hasIcons,
    'has-font-variant-caps': !!caps,
  })

  let childString = ''
  const children = React.Children.map(nativeProps.children, child => {
    if (typeof child === 'string') {
      childString = child

      return React.createElement('span', {}, child)
    }

    return child
  })

  const documentTitle = typeof _documentTitle === 'string' ? _documentTitle : childString
  const setDocumentTitle = typeof _documentTitle === 'string' ? !!_documentTitle : (!!_documentTitle && !!childString)
  useDocumentTitleEffect(documentTitle, !setDocumentTitle)

  let parsedDate = undefined
  if (date) {
    if (typeof date === 'number' || typeof date === 'string') {
      parsedDate = new Date(date)
    } else {
      parsedDate = date
    }
  }

  let dateAsString = undefined
  if (parsedDate) {
    dateAsString = dateFormat.format(parsedDate)
  }

  const { Linkify } = useContext(Context)

  const elementChildren = dateAsString ?? children
  const element = (
    <Element {...nativeProps as any} ref={innerRef as any} className={className}>
      {(linkify && Linkify) && (
        <Linkify componentDecorator={LinkifyBulmaADecorator}>{elementChildren}</Linkify>
      )}
      {!linkify && (
        elementChildren
      )}
    </Element>
  )

  if (hashLink && nativeProps.id) {
    return (
      <A href={`#${nativeProps.id}`} className="is-hashlink icon-text" replace>
        <Icon icon={textIcons.faLink} size="small" />
        {element}
      </A>
    )
  }

  return element
}

export default Object.assign(React.memo(Text), {
  Context,
})
