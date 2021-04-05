import { useMemo } from 'react'
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

  const getValue = useMemo(() => {
    return (name: any) =>
      _getValues(name)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setValue = useMemo(() => {
    return (name: any, value: any) =>
      _setValue(name, value, { shouldDirty: true, shouldValidate: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getError = useMemo(() => {
    return (name: any) =>
      errors[name]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setError = useMemo(() => {
    return (name: any, value: any) => {
      if (value) {
        _setError(name, value)
      } else {
        _clearErrors(name)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
