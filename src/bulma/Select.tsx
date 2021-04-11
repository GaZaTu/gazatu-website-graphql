import classNames from 'classnames'
import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Control from './Control'
import Dropdown from './Dropdown'
import Field from './Field'
import Form, { RegisterOptions } from './Form'
import Input from './Input'
import { Color } from './utils/classes'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'

type OptionProps = {
  option: any
}

const Option: React.FC<OptionProps> = props => null

type Props = Omit<HTMLProps<'div'>, 'onChange' | 'defaultValue'> & {
  name?: string
  options?: any[]
  getKey?: (option: any) => string
  getValue?: (option: any) => any
  getLabel?: (option: any) => string
  getLabelElement?: (label: string, option: any) => React.ReactNode
  value?: any
  onChange?: (value: any) => void
  defaultValue?: any
  color?: Color
  size?: 'small' | 'normal' | 'medium' | 'large'
  hovered?: boolean
  focused?: boolean
  labelized?: boolean
  filterable?: boolean
  // editable?: boolean
  // multiple?: boolean
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  validate?: RegisterOptions['validate']
  usePortal?: boolean
}

const Select: React.FC<Props> = props => {
  const {
    name,
    options,
    getKey = o => String(o),
    getValue = o => o,
    getLabel: _getLabelString,
    getLabelElement: _getLabelElement,
    value: _value,
    onChange: _onChange,
    defaultValue,
    color: _color,
    size,
    hovered,
    focused,
    labelized,
    filterable,
    // editable,
    readOnly,
    disabled,
    required,
    validate,
    usePortal,
    children,
    innerRef: _innerRef,
    ...nativeProps
  } = props

  let color = _color

  let value = _value
  let onChange = _onChange

  let innerRef = _innerRef

  const getLabelString = useMemo(() => {
    return (option: any) => {
      if (_getLabelString) {
        return _getLabelString(option)
      }

      return String(option)
    }
  }, [_getLabelString])

  const getLabelElement = useMemo(() => {
    return (option: any) => {
      if (_getLabelElement) {
        return _getLabelElement(getLabelString(option), option)
      }

      return getLabelString(option)
    }
  }, [_getLabelElement, getLabelString])

  const { setIsValidating } = useContext(Control.Context)

  const { setRequired, setError } = useContext(Field.Context)
  useLayoutEffect(() => setRequired(!!required), [setRequired, required])

  const { useController } = useContext(Form.Context)
  const controller = useController({
    name,
    defaultValue,
    rules: {
      required,
      validate,
    },
  })

  if (controller) {
    const {
      field,
      fieldState: {
        isDirty,
        isTouched,
        invalid,
      },
    } = controller

    onChange = field.onChange
    nativeProps.onBlur = field.onBlur

    value = field.value

    innerRef = field.ref

    if ((isDirty || isTouched) && invalid) {
      color = 'danger'
    }
  }

  useLayoutEffect(() => {
    if (!controller?.fieldState) {
      return
    }

    const {
      error,
      isDirty,
      isTouched,
      isValidating,
    } = controller.fieldState

    setError((isDirty || isTouched) ? error : undefined)
    setIsValidating(isValidating)
  }, [controller?.fieldState, setError, setIsValidating])

  const [valueState, setValueState] = useState(value ?? defaultValue)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (valueState === value) {
      return
    }

    setIsTyping(false)
    onChange?.(valueState)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueState])
  useEffect(() => {
    if (value === valueState) {
      return
    }

    setValueState?.(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (isTyping) {
      return
    }

    setInputValue(valueState ? getLabelString(valueState) : '')
  }, [valueState, getLabelString, isTyping])

  const className = classNames(nativeProps.className, {
    'select': true,
    'has-max-width-100percent': true,
    [`is-${color}`]: !!color,
    [`is-${size}`]: !!size,
    'is-hovered': !!hovered,
    'is-focused': !!focused,
    'is-static': !!labelized,
  })

  const [highlightedOptionIndex, setHighlightedOptionIndex] = useState(filterable ? 0 : -1)
  const filteredOptions = useMemo(() => {
    setHighlightedOptionIndex(filterable ? 0 : -1)

    if (!options) {
      return undefined
    }

    if (filterable) {
      if (valueState && (inputValue === getLabelString(valueState))) {
        return options
      }

      return options
        ?.filter(option => getLabelString(option).toLowerCase().startsWith(inputValue.toLowerCase()))
    }

    if (required) {
      return options
    }

    return [undefined, ...options]
  }, [options, filterable, inputValue, valueState, getLabelString, required, setHighlightedOptionIndex])

  const optionChildren = getChildrenByTypeAndProps(children, [Option], {})

  const handleInputChange = useMemo(() => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsTyping(true)
      setInputValue(event.currentTarget.value)
    }
  }, [])

  const handleInputKeydown = useMemo(() => {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowUp':
          setHighlightedOptionIndex(i => Math.max(i - 1, 0))
          break
        case 'ArrowDown':
          setHighlightedOptionIndex(i => Math.min(i + 1, (filteredOptions?.length ?? 0) - 1))
          break
        case 'Enter':
          setValueState(filteredOptions?.[highlightedOptionIndex])
          break
        default:
          return
      }

      event.preventDefault()
    }
  }, [filteredOptions, highlightedOptionIndex])

  const handleItemClick = useMemo(() => {
    return (event: React.MouseEvent<HTMLElement>) => {
      if (event.currentTarget.nodeName !== 'A') {
        return
      }

      const key = event.currentTarget.dataset.option
      const value = key && (options ?? [])
        .filter(o => getKey(o) === key)
        .map(o => getValue(o))
        .find(() => true)

      setValueState(value)
    }
  }, [options, getKey, setValueState, getValue])

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Dropdown disabled={readOnly} narrow={!filterable} usePortal={usePortal} hasMaxWidth100Percent hasMaxHeight300px>
        <Dropdown.Trigger>
          <Input type="text" value={inputValue} onChange={handleInputChange} onKeyDown={handleInputKeydown} color={color} size={size} hovered={hovered} focused={focused} labelized={labelized} readOnly={!filterable || readOnly} disabled={disabled} />
        </Dropdown.Trigger>
        <Dropdown.Menu style={{ marginTop: usePortal ? (filterable ? '2.2rem' : '1.1rem') : undefined }}>
          <Dropdown.Context.Consumer>
            {({ setActiveState }) => {
              const onClick = (event: React.MouseEvent<HTMLElement>) => {
                handleItemClick(event)
                setActiveState(false)
              }

              if (optionChildren.length) {
                return optionChildren
                  .map(child => child.props)
                  .map(({ option, children }) => {
                    const key = option ? getKey(option) : ''

                    return (
                      <Dropdown.Item key={key} data-option={key} as={readOnly ? 'div' : 'a'} onClick={onClick}>{children}</Dropdown.Item>
                    )
                  })
              }

              return filteredOptions
                ?.map((option, i) => {
                  if (!option) {
                    return (
                      <Dropdown.Item key="__empty" as={readOnly ? 'div' : 'a'} onClick={onClick} active={i === highlightedOptionIndex}>&nbsp;</Dropdown.Item>
                    )
                  }

                  const key = getKey(option)
                  const label = getLabelElement(option)

                  return (
                    <Dropdown.Item key={key} data-option={key} as={readOnly ? 'div' : 'a'} onClick={onClick} active={i === highlightedOptionIndex}>{label}</Dropdown.Item>
                  )
                })
            }}
          </Dropdown.Context.Consumer>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

export default Object.assign(React.memo(Select), {
  Option,
})
