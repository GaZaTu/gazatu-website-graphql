import classNames from 'classnames'
import React, { useContext, useLayoutEffect } from 'react'
import Control from './Control'
import Field from './Field'
import Form, { RegisterOptions } from './Form'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type Props = Omit<HTMLProps<'textarea'>, 'size'> & {
  color?: Color
  size?: 'small' | 'normal' | 'medium' | 'large'
  hovered?: boolean
  focused?: boolean
  fixedSize?: boolean
  validate?: RegisterOptions['validate']
  emptyValue?: '' | 'null' | 'undefined'
  onValueChange?: (value: any) => void
  filter?: string | ((value: string) => string)
}

const TextArea: React.FC<Props> = props => {
  const {
    color: _color,
    size,
    hovered,
    focused,
    fixedSize,
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

  const { labelAsString, setRequired, setError } = useContext(Field.Context)
  useLayoutEffect(() => setRequired(!!nativeProps.required), [setRequired, nativeProps.required])

  if (!nativeProps.placeholder && labelAsString) {
    nativeProps.placeholder = `${labelAsString}...`
  }

  if (onValueChange) {
    nativeProps.onChange = event => {
      onValueChange(event.target.value)
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
      maxLength: nativeProps.maxLength,
      minLength: nativeProps.minLength,
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
      if (event.target.value === '') {
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

    nativeProps.value = field.value ?? ''

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
    'textarea': true,
    [`is-${color}`]: !!color,
    [`is-${size}`]: !!size,
    'is-hovered': !!hovered,
    'is-focused': !!focused,
    'has-fixed-size': !!fixedSize,
  })

  return (
    <textarea {...nativeProps} ref={innerRef} className={className} />
  )
}

export default React.memo(TextArea)
