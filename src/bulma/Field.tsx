import classNames from 'classnames'
import React, { useContext, useState } from 'react'
import Form from './Form'
import { Color } from './utils/classes'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'

const Context = React.createContext({
  label: undefined as React.ReactNode | undefined,
  helpColor: undefined as Color | undefined,

  id: undefined as string | undefined,
  setId: (id: string | undefined) => {},

  name: undefined as string | undefined,
  setName: (name: string | undefined) => {},

  labelHidden: false as boolean,
  setLabelHidden: (hidden: boolean) => {},
})

type LabelProps = HTMLProps<'label'> & {
  size?: 'small' | 'normal' | 'medium' | 'large'
}

const Label: React.FC<LabelProps> = () => null

type HelpProps = HTMLProps<'p'> & {
  color?: Color
}

const Help: React.FC<HelpProps> = () => null

type Props = HTMLProps<'div'> & {
  label?: React.ReactNode
  labelProps?: JSX.IntrinsicElements['label']
  labelSize?: 'small' | 'normal' | 'medium' | 'large'
  help?: React.ReactNode
  helpProps?: JSX.IntrinsicElements['p']
  helpColor?: Color
  grouped?: boolean
  groupedMultiline?: boolean
  hasAddons?: boolean
  align?: 'left' | 'right' | 'centered'
  horizontal?: boolean
  narrow?: boolean
}

const Field: React.FC<Props> = props => {
  const {
    label: _label,
    labelProps: _labelProps,
    labelSize: _labelSize,
    help: _help,
    helpProps: _helpProps,
    helpColor: _helpColor,
    grouped,
    groupedMultiline,
    hasAddons,
    align,
    horizontal,
    narrow,
    children,
    innerRef,
    ...nativeProps
  } = props

  const labelChild = (getChildrenByTypeAndProps(children, [Label], {})[0] as any)?.props as LabelProps | undefined
  const label = labelChild?.children ?? _label
  const labelProps = Object.assign({ ...(labelChild ?? _labelProps) }, { children: undefined, size: undefined })
  const labelSize = labelChild?.size ?? _labelSize

  const helpChild = (getChildrenByTypeAndProps(children, [Help], {})[0] as any)?.props as HelpProps | undefined
  const help = helpChild?.children ?? _help
  const helpProps = Object.assign({ ...(helpChild ?? _helpProps) }, { children: undefined, color: undefined })
  const helpColor = helpChild?.color ?? _helpColor

  const [id, setId] = useState<string>()
  const [name, setName] = useState<string>()
  const [labelHidden, setLabelHidden] = useState(false)

  const form = useContext(Form.Context)
  const error = (() => {
    if (!name) {
      return undefined
    }

    const errorResult = form.getError?.(name)

    if (!errorResult) {
      return undefined
    }

    if (typeof errorResult === 'object') {
      return errorResult.message || errorResult.type
    }

    return errorResult
  })()

  const className = classNames(nativeProps.className, {
    'field': true,
    'is-horizontal': !!horizontal,
    'is-narrow': !!narrow,
    'is-grouped': !!grouped,
    [`is-grouped-${align}`]: !!grouped && !!align,
    'is-grouped-multiline': !!groupedMultiline,
    'has-addons': !!hasAddons,
    [`has-addons-${align}`]: !hasAddons && !!align,
  })

  const context = { label, helpColor, id, setId, name, setName, labelHidden, setLabelHidden }

  const labelNode = label && !labelHidden && (
    <label {...labelProps} className="label">{label}</label>
  )

  const helpNode = help && (
    <p {...helpProps} className={`help is-${helpColor}`}>{help}</p>
  )

  const errorNode = error && (
    <p {...helpProps} className="help is-danger">{error}</p>
  )

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Context.Provider value={context}>
        {horizontal ? (
          <div className={`field-label is-${labelSize ?? 'normal'}`}>{labelNode}</div>
        ) : (
          labelNode
        )}
        {horizontal ? (
          <div className="field-body">{children}</div>
        ) : (
          children
        )}
        {helpNode}
        {errorNode}
      </Context.Provider>
    </div>
  )
}

export default Object.assign(React.memo(Field), {
  Context,
  Label,
  Help,
})
