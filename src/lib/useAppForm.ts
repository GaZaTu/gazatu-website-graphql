import { useForm, UseFormOptions } from 'react-hook-form'

const useAppForm = <T extends Record<string, any>>(options: UseFormOptions<T>) => {
  const {
    register,
    getValues: _getValues,
    setValue: _setValue,
    setError: _setError,
    clearErrors: _clearErrors,
    ...form
  } = useForm<T>({
    mode: 'all',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    ...options,
  })

  const {
    errors,
    isDirty,
    isValid,
    isValidating,
    isSubmitting,
  } = form.formState

  const getValue = (name: any) =>
    _getValues(name)

  const setValue = (name: any, value: any) =>
    _setValue(name, value, { shouldDirty: true, shouldValidate: true })

  const getError = (name: any) =>
    errors[name]

  const setError = (name: any, value: any) => {
    if (value) {
      _setError(name, value)
    } else {
      _clearErrors(name)
    }
  }

  return {
    ...form,
    context: {
      register,
      getValue,
      setValue,
      getError,
      setError,
    },
    canSubmit: isDirty && isValid,
    isLoading: isValidating || isSubmitting,
  }
}

export default useAppForm
