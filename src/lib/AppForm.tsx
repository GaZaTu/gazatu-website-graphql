import React from 'react'
import Form from '../bulma/Form'
import { FormContext, useController, UseControllerProps, useForm, UseFormProps, UseFormResult } from './useForm'

export const useAppForm = (opts: UseFormProps) => {
  const form = useForm(opts)
  const {
    formState: {
      isDirty,
      isValid,
      isValidating,
      isSubmitting,
    },
  } = form

  return {
    ...form,
    canSubmit: isDirty && isValid,
    submitting: isValidating || isSubmitting,
    reset: form.reset as (values?: any, keepStateOptions?: any) => void,
  }
}

export const useAppController = (opts: UseControllerProps) => {
  // const defaultName = useIdRef()
  const controller = useController({
    ...opts,
    // name: (opts.name ?? defaultName) as any,
    // control: opts.control as any,
  })

  if (!opts.name) {
    return undefined
  }

  return controller
}

type Props = Omit<React.ComponentProps<typeof Form>, 'context'> & {
  form: UseFormResult
}

const AppForm: React.FC<Props> = props => {
  const {
    form,
    children,
    innerRef,
    ...nativeProps
  } = props

  const context = {
    useController: useAppController,
  }

  return (
    <Form {...nativeProps} innerRef={innerRef} context={context}>
      <FormContext.Provider value={form}>
        {children}
      </FormContext.Provider>
    </Form>
  )
}

export default React.memo(AppForm)
