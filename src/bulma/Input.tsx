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
  setValueAs?: RegisterOptions['setValueAs']
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
    setValueAs,
    children,
    innerRef: _innerRef,
    ...nativeProps
  } = props

  let innerRef = _innerRef

  const { setSize } = useContext(Control.Context)
  useLayoutEffect(() => setSize(size), [size, setSize])

  const { setName, label, labelAsString, setLabelHidden, setRequired } = useContext(Field.Context)
  useLayoutEffect(() => setName(nativeProps.name), [setName, nativeProps.name])
  useLayoutEffect(() => setLabelHidden(nativeProps.type === 'checkbox'), [setLabelHidden, nativeProps.type])
  useLayoutEffect(() => setRequired(!!nativeProps.required), [setRequired, nativeProps.required])

  if (!nativeProps.placeholder && labelAsString) {
    nativeProps.placeholder = `${labelAsString}...`
  }

  const form = useContext(Form.Context)
  if (nativeProps.name && !nativeProps.onChange && (form.register || (form.getValue && form.setValue))) {
    if (form.register) {
      const {
        required,
        min,
        max,
        maxLength,
        minLength,
        pattern,
        type,
      } = nativeProps

      innerRef = form.register({
        required,
        min,
        max,
        maxLength,
        minLength,
        pattern: pattern ? new RegExp(pattern) : undefined,
        validate,
        valueAsNumber: type === 'number',
        valueAsDate: type === 'date',
        setValueAs,
      })
    } else {
      if (nativeProps.type === 'checkbox') {
        nativeProps.checked = !!form.getValue!(nativeProps.name)
        nativeProps.onChange = e => {
          const { name, checked } = e.currentTarget

          form.setValue!(name, checked)

          if (validate && form.setError) {
            // TODO
          }
        }
      } else {
        const formValue = form.getValue!(nativeProps.name)

        nativeProps.value = setValueAs ? setValueAs(formValue) : formValue
        nativeProps.onChange = e => {
          const { name, value: valueAsString, valueAsNumber, valueAsDate } = e.currentTarget
          const value = valueAsDate ?? valueAsNumber ?? valueAsString

          form.setValue!(name, value)

          if (validate && form.setError) {
            // TODO
          }
        }
      }
    }
  }

  const color = (() => {
    if (nativeProps.name && form.getError) {
      if (form.getError(nativeProps.name)) {
        return 'danger'
      }
    }

    return _color
  })()

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
            <span>{label ?? children}</span>
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
