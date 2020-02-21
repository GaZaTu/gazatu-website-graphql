import React from 'react'
import useForm from './useForm'

type Values = {
  [name: string]: any
}

type ValuesAs<V, T> = {
  [P in keyof V]: T
}

type Errors<V> = Partial<ValuesAs<V, string>>

type FormContextData = Omit<ReturnType<typeof useForm>, 'formProps'>

const FormContext = React.createContext<FormContextData>({
  values: {},
  errors: {},
  formState: {
    isValid: false,
    isValidating: false,
    isSubmitting: false,
    isSubmittable: false,
  },
  reset: () => {},
  submit: () => ({} as any),
  inputProps: () => ({} as any),
  checkboxProps: () => ({} as any),
  radioProps: () => ({} as any),
  selectProps: () => ({} as any),
  controlProps: () => ({} as any),
  customControlProps: () => ({} as any),
})

type Props = Omit<React.HTMLProps<HTMLFormElement>, 'onSubmit'> & /* Parameters<typeof useForm>[0] & */ {
  initialValues: Values
  onSubmit: (values: any) => unknown | Promise<unknown>
  onValidate?: (values: any) => Errors<Values> | Promise<Errors<Values>>
}

const Form: React.FC<Props> = props => {
  const { children, initialValues, onSubmit, onValidate, ...nativeProps } = props
  const { formProps, ...form } = useForm({ initialValues, onSubmit, onValidate })

  return (
    <form {...nativeProps} {...formProps}>
      <FormContext.Provider value={form}>
        {children}
      </FormContext.Provider>
    </form>
  )
}

export default Object.assign(Form, {
  Context: FormContext,
})
