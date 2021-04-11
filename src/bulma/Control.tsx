import classNames from 'classnames'
import React, { useState } from 'react'
import Icon from './Icon'
import childMatches from './utils/childMatches'
import { HTMLProps } from './utils/HTMLProps'

type Size = 'small' | 'normal' | 'medium' | 'large'

const Context = React.createContext({
  size: undefined as Size | undefined,
  setSize: (size: Size | undefined) => {},

  isValidating: false as boolean,
  setIsValidating: (isValidating: boolean) => {},
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
  const [isValidating, setIsValidating] = useState(false)

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
    'has-direct-icons-left': !!iconsLeft.length,
    'has-direct-icons-right': !!iconsRight.length,
    'is-expanded': !!expanded,
    'is-loading': !!loading || !!isValidating,
    [`is-${size}`]: !!size,
  })

  const context = { size, setSize, isValidating, setIsValidating }

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Context.Provider value={context}>
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
