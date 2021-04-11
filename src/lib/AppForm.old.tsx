import React from 'react'
import { FormProvider, KeepStateOptions, useController, useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import Form, { UseControllerOptions } from '../bulma/Form'
import useIdRef from './useIdRef'

export const useAppForm = (opts: UseFormProps) => {
  const form = useForm({
    mode: 'all',
    ...opts,
  })
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
    reset: form.reset as (values: any, keepStateOptions?: KeepStateOptions) => void,
  }
}

export const useAppController = (opts: UseControllerOptions) => {
  const defaultName = useIdRef()
  const controller = useController({
    ...opts,
    name: (opts.name ?? defaultName) as any,
    control: opts.control as any,
  })

  if (!opts.name) {
    return undefined
  }

  return controller
}

type Props = Omit<React.ComponentProps<typeof Form>, 'context'> & {
  form: UseFormReturn
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
      <FormProvider {...form}>
        {children}
      </FormProvider>
    </Form>
  )
}

export default React.memo(AppForm)
