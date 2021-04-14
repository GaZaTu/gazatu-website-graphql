import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'div'> & {
  text?: string
  vertical?: boolean
}

const Block: React.FC<Props> = props => {
  const {
    text,
    vertical,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'is-divider': !vertical,
    'is-divider-vertical': vertical,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className} data-content={text}>
      {children}
    </div>
  )
}

export default React.memo(Block)
