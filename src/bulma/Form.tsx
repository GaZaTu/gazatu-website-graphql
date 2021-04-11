import classNames from 'classnames'
import React from 'react'
import { HTMLProps } from './utils/HTMLProps'

export type ValidationValue = boolean | number | string | RegExp
export type ValidationRule<TValidationValue extends ValidationValue = ValidationValue> = TValidationValue | ValidationValueMessage<TValidationValue>
export type ValidationValueMessage<TValidationValue extends ValidationValue = ValidationValue> = {
    value: TValidationValue
    message: string
}
export type ValidateResult = string | string[] | boolean | undefined
export type Validate = (data: any) => ValidateResult | Promise<ValidateResult>
export type RegisterOptions = {
    required?: boolean
    min?: string | number
    max?: string | number
    maxLength?: number
    minLength?: number
    pattern?: RegExp
    validate?: Validate
}

export type Control = unknown
export type UseControllerOptions = {
  name?: string
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>
  defaultValue?: unknown
  control?: Control
}
export type UseControllerInstance = {
  field: {
    onChange: (...event: any[]) => void
    onBlur: () => void
    value: any
    name: string
    ref: React.Ref<any>
  }
  fieldState: {
    invalid: boolean
    isTouched: boolean
    isDirty: boolean
    isValidating: boolean
    error?: any
  }
}

export type UseController = (opts: UseControllerOptions) => UseControllerInstance | undefined

const Context = React.createContext({
  useController: (() => undefined) as UseController,
})

type Props = HTMLProps<'form'> & {
  context: React.ContextType<typeof Context>
}

const Form: React.FC<Props> = props => {
  const {
    context,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'form': true,
  })

  return (
    <form {...nativeProps} ref={innerRef} className={className}>
      <Context.Provider value={context}>
        {children}
      </Context.Provider>
    </form>
  )
}

export default Object.assign(React.memo(Form), {
  Context,
})
