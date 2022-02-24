import classNames from 'classnames'
import React, { useContext, useLayoutEffect } from 'react'
import Control from './Control'
import Field from './Field'
import Form, { RegisterOptions } from './Form'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type Props = Omit<HTMLProps<'input'>, 'size'> & {
  color?: Color
  size?: 'small' | 'normal' | 'medium' | 'large'
  hovered?: boolean
  focused?: boolean
  labelized?: boolean
  rounded?: boolean
  validate?: RegisterOptions['validate']
  emptyValue?: '' | 'null' | 'undefined'
  onValueChange?: (value: any) => void
  filter?: string | ((value: string) => string)
}

const Input: React.FC<Props> = props => {
  const {
    color: _color,
    size,
    hovered,
    focused,
    labelized,
    rounded,
    validate,
    emptyValue = 'undefined',
    onValueChange,
    filter,
    children,
    innerRef: _innerRef,
    ...nativeProps
  } = props

  let color = _color
  let innerRef = _innerRef

  const { setSize, setIsValidating } = useContext(Control.Context)
  useLayoutEffect(() => setSize(size), [size, setSize])

  const { label, labelAsString, setLabelHidden, setRequired, setError } = useContext(Field.Context)
  useLayoutEffect(() => setLabelHidden(nativeProps.type === 'checkbox'), [setLabelHidden, nativeProps.type])
  useLayoutEffect(() => setRequired(!!nativeProps.required), [setRequired, nativeProps.required])

  if (!nativeProps.placeholder && labelAsString) {
    nativeProps.placeholder = `${labelAsString}...`
  }

  if (onValueChange) {
    nativeProps.onChange = event => {
      if (event.target.type === 'checkbox') {
        onValueChange(event.target.checked)
      } else {
        onValueChange(event.target.value)
      }
    }
  }

  if (filter) {
    const validate = (() => {
      if (typeof filter === 'string') {
        return (value: string) => {
          if (!value) {
            return value
          }

          return value.replace(new RegExp(filter), '')
        }
      } else {
        return filter
      }
    })()

    nativeProps.onInput = event => {
      event.currentTarget.value = validate(event.currentTarget.value)
    }
  }

  const { useController } = useContext(Form.Context)
  const controller = useController({
    name: nativeProps.name,
    defaultValue: nativeProps.defaultValue,
    rules: {
      required: nativeProps.required,
      min: nativeProps.min,
      max: nativeProps.max,
      maxLength: nativeProps.maxLength,
      minLength: nativeProps.minLength,
      pattern: nativeProps.pattern ? new RegExp(nativeProps.pattern) : undefined,
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

    nativeProps.onChange = event => {
      if (event.target.type === 'text' && event.target.value === '') {
        switch (emptyValue) {
          case '':
            return field.onChange('')
          case 'null':
            return field.onChange(null)
          case 'undefined':
            return field.onChange(undefined)
        }
      }

      field.onChange(event)
    }
    nativeProps.onBlur = field.onBlur

    if (nativeProps.type === 'checkbox') {
      nativeProps.checked = field.value ?? false
    } else {
      nativeProps.value = field.value ?? ''
    }

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

  const className = classNames(nativeProps.className, {
    'input': true,
    [`is-${color}`]: !!color,
    [`is-${size}`]: !!size,
    'is-hovered': !!hovered,
    'is-focused': !!focused,
    'is-static': !!labelized,
    'is-rounded': !!rounded,
  })

  switch (nativeProps.type) {
    case 'checkbox':
      return (
        <label className="checkbox has-svg" {...{ disabled: nativeProps.disabled }}>
          <input {...nativeProps} ref={innerRef} className={className} />
          <span>
            <svg viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeMiterlimit="10" fill="none" d="M22.9 3.7l-15.2 16.6-6.6-7.1" />
            </svg>
            <span>{label ?? children ?? nativeProps.placeholder}</span>
          </span>
        </label>
      )

    default:
      return (
        <input {...nativeProps} ref={innerRef} className={className} />
      )
  }
}

export default React.memo(Input)
