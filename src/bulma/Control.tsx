import classNames from 'classnames'
import React, { useState } from 'react'
import Icon from './Icon'
import childMatches from './utils/childMatches'
import { HTMLProps } from './utils/HTMLProps'

type Size = 'small' | 'normal' | 'medium' | 'large'

const Context = React.createContext({
  size: undefined as Size | undefined,
  setSize: (size: Size | undefined) => {},
})

type Props = HTMLProps<'div'> & {
  expanded?: boolean
  loading?: boolean
}

const Control: React.FC<Props> = props => {
  const {
    expanded,
    loading,
    innerRef,
    ...nativeProps
  } = props

  const [size, setSize] = useState<Size>()

  let iconCount = 0
  let iconsLeft = [] as React.ReactNode[]
  let iconsRight = [] as React.ReactNode[]
  let foundNonIcon = false
  const children =
    React.Children.map(nativeProps.children, child => {
      if (childMatches(child, [Icon], {})) {
        const element = React.cloneElement(child as any, { key: iconCount++, align: foundNonIcon ? 'right' : 'left' })

        if (foundNonIcon) {
          iconsRight.push(element)
        } else {
          iconsLeft.push(element)
        }

        return undefined
      }

      foundNonIcon = true
      return child
    })
    ?.filter(child => !!child)

  const className = classNames(nativeProps.className, {
    'control': true,
    'has-icons-left': !!iconsLeft.length,
    'has-icons-right': !!iconsRight.length,
    'is-expanded': !!expanded,
    'is-loading': !!loading,
    [`is-${size}`]: !!size,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Context.Provider value={{ size, setSize }}>
        {children}
        {iconsLeft}
        {iconsRight}
      </Context.Provider>
    </div>
  )
}

export default Object.assign(React.memo(Control), {
  Context,
})
