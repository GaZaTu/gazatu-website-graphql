import classNames from 'classnames'
import React from 'react'
import { Span } from './Text'
import { HTMLProps } from './utils/HTMLProps'

type SuspenseProps = {
  title?: React.ReactNode
}

const Suspense: React.FC<SuspenseProps> = props => {
  const {
    title,
    children
  } = props

  const fallback = (
    <Pageloader active>
      {title && (
        <Span kind="title">{title}</Span>
      )}
    </Pageloader>
  )

  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  )
}

type Props = HTMLProps<'div'> & {
  active?: boolean
}

const Pageloader: React.FC<Props> = props => {
  const {
    active,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'pageloader': true,
    'is-active': !!active,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default Object.assign(React.memo(Pageloader), {
  Suspense,
})
