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
    required?: string | ValidationRule<boolean>
    min?: ValidationRule<number | string>
    max?: ValidationRule<number | string>
    maxLength?: ValidationRule<number | string>
    minLength?: ValidationRule<number | string>
    pattern?: ValidationRule<RegExp>
    validate?: Validate | Record<string, Validate>
    valueAsNumber?: boolean
    valueAsDate?: boolean
    setValueAs?: (value: any) => any
}

export type RegisterFunction = {
  (opts: RegisterOptions): React.RefCallback<HTMLElement>
  (name: { name: string, type: 'custom' }, opts?: RegisterOptions): void
}

const Context = React.createContext({
  register: undefined as undefined | RegisterFunction,
  getValue: undefined as undefined | ((name: string) => any),
  setValue: undefined as undefined | ((name: string, value: any) => void),
  getError: undefined as undefined | ((name: string) => any),
  setError: undefined as undefined | ((name: string, value: any) => void),
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
