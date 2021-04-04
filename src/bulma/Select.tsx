import classNames from 'classnames'
import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
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

type Props = Omit<HTMLProps<'div'>, 'onChange'> & {
  name?: string
  options?: any[]
  getKey?: (option: any) => string
  getValue?: (option: any) => any
  getLabel?: (option: any) => string
  getLabelElement?: (label: string, option: any) => React.ReactNode
  value?: any
  onChange?: (value: any) => void
  color?: Color
  size?: 'small' | 'normal' | 'medium' | 'large'
  hovered?: boolean
  focused?: boolean
  labelized?: boolean
  filterable?: boolean
  editable?: boolean
  // multiple?: boolean
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  validate?: RegisterOptions['validate']
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
    color,
    size,
    hovered,
    focused,
    labelized,
    filterable,
    editable,
    readOnly,
    disabled,
    required,
    children,
    innerRef,
    ...nativeProps
  } = props

  let value = _value
  let onChange = _onChange

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

  const { setName, setRequired } = useContext(Field.Context)
  useLayoutEffect(() => setName(name), [setName, name])
  useLayoutEffect(() => setRequired(!!required), [setRequired, required])

  const form = useContext(Form.Context)
  if (name && !onChange && (form.getValue && form.setValue)) {
    value = form.getValue!(name)
    onChange = value => {
      form.setValue!(name, value)

      if (form.setError) {
        if (required) {
          if (value) {
            form.setError(name, undefined)
          } else {
            form.setError(name, 'required')
          }
        }
      }
    }
  }

  useLayoutEffect(() => {
    if (name && form.register) {
      form.register({ name, type: 'custom' }, { required })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const className = classNames(nativeProps.className, {
    'select': true,
    [`is-${color}`]: !!color,
    [`is-${size}`]: !!size,
    'is-hovered': !!hovered,
    'is-focused': !!focused,
    'is-static': !!labelized,
  })

  const [inputValue, setInputValue] = useState('')
  useEffect(() => {
    setInputValue(value ? getLabelString(value) : '')
  }, [value, getLabelString])

  const filteredOptions = useMemo(() => {
    if (!options) {
      return undefined
    }

    if (filterable) {
      return options
        ?.filter(option => getLabelString(option).toLowerCase().startsWith(inputValue.toLowerCase()))
    }

    if (required) {
      return options
    }

    return [undefined, ...options]
  }, [options, filterable, inputValue, getLabelString, required])

  const optionChildren = getChildrenByTypeAndProps(children, [Option], {})

  const handleInputChange = useMemo(() => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.currentTarget.value)
    }
  }, [setInputValue])

  const handleItemClick = useMemo(() => {
    return (event: React.MouseEvent<HTMLElement>) => {
      if (event.currentTarget.nodeName !== 'A') {
        return
      }

      const key = event.currentTarget.dataset.option
      let value = undefined

      if (key) {
        for (const option of options ?? []) {
          if (getKey(option) === key) {
            value = getValue(option)
          }
        }
      }

      onChange?.(value)
    }
  }, [options, getKey, onChange, getValue])

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Dropdown narrow={!editable && !filterable}>
        <Dropdown.Trigger>
          <Input type="text" value={inputValue} onChange={handleInputChange} color={color} size={size} hovered={hovered} focused={focused} labelized={labelized} readOnly={(!filterable && !editable) || readOnly} disabled={disabled} />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Context.Consumer>
            {dropdown => {
              const onClick = (event: React.MouseEvent<HTMLElement>) => {
                handleItemClick(event)
                dropdown.setActiveState(false)
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
                ?.map(option => {
                  if (!option) {
                    return (
                      <Dropdown.Item key="__empty" as={readOnly ? 'div' : 'a'} onClick={onClick}>&nbsp;</Dropdown.Item>
                    )
                  }

                  const key = getKey(option)
                  const label = getLabelElement(option)

                  return (
                    <Dropdown.Item key={key} data-option={key} as={readOnly ? 'div' : 'a'} onClick={onClick}>{label}</Dropdown.Item>
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
