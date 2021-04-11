import React, { useContext, useEffect, useMemo, useState } from 'react'

export const FormContext = React.createContext<UseFormResult | undefined>(undefined)

export type UseFormProps = {
  defaultValues?: { [key: string]: any }
}

type UseFormGetValues = (names: string[]) => any[]
type UseFormSetError = (name: string, error: any) => void
type UseFormClearErrors = (name: string) => void
type UseFormSetValue = (name: string, value: any) => void
type UseFormReset = (values?: any) => void
type UseFormHandleSubmit = (onSubmit: (values: any) => unknown) => React.FormEventHandler<HTMLFormElement>
type UseFormTouch = (name: string) => void

type UseFormState = {
  isDirty: boolean
  dirtyFields: { [key: string]: boolean }
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  submitCount: number
  touchedFields: { [key: string]: boolean }
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  errors: { [key: string]: any }
  resetCount: number
}

export type UseFormResult = {
  getValues: UseFormGetValues
  setError: UseFormSetError
  clearErrors: UseFormClearErrors
  setValue: UseFormSetValue
  formState: UseFormState
  reset: UseFormReset
  handleSubmit: UseFormHandleSubmit
  touch: UseFormTouch
}

type UseForm = (props: UseFormProps) => UseFormResult

const defaultUseFormState = (resetCount: number): UseFormState => ({
  isDirty: false,
  dirtyFields: {},
  isSubmitted: false,
  isSubmitSuccessful: false,
  submitCount: 0,
  touchedFields: {},
  isSubmitting: false,
  isValidating: false,
  isValid: false,
  errors: {},
  resetCount,
})

export const useForm: UseForm = props => {
  const { defaultValues } = props

  const [formState, setFormState] = useState(defaultUseFormState(0))
  const [values, setValues] = useState({ ...defaultValues })

  const getValues = useMemo<UseFormGetValues>(() => {
    return names => {
      return Object.entries(values)
        .filter(([name]) => names.includes(name))
        .map(([, value]) => value)
    }
  }, [values])

  const setError = useMemo<UseFormSetError>(() => {
    return (name, error) => {
      setFormState(state => ({
        ...state,
        errors: {
          ...state.errors,
          [name]: error,
        },
      }))
    }
  }, [])

  const clearErrors = useMemo<UseFormClearErrors>(() => {
    return name => {
      setFormState(state => ({
        ...state,
        errors: {
          ...state.errors,
          [name]: undefined,
        },
      }))
    }
  }, [])

  const setValue = useMemo<UseFormSetValue>(() => {
    return (name, value) => {
      setFormState(state => ({
        ...state,
        dirtyFields: {
          ...state.dirtyFields,
          [name]: true,
        },
      }))
      setValues(values => ({
        ...values,
        [name]: value,
      }))
    }
  }, [])

  const reset = useMemo<UseFormReset>(() => {
    return values => {
      setFormState(state => defaultUseFormState(state.resetCount + 1))
      setValues(values ? { ...values } : { ...defaultValues })
    }
  }, [defaultValues])

  const handleSubmit = useMemo<UseFormHandleSubmit>(() => {
    return onSubmit => {
      return async event => {
        event.preventDefault()
        event.stopPropagation()

        setFormState(state => ({
          ...state,
          isSubmitting: true,
        }))

        try {
          await onSubmit(values)
        } finally {
          setFormState(state => ({
            ...state,
            isSubmitting: false,
            isSubmitted: true,
            submitCount: state.submitCount + 1,
          }))
        }
      }
    }
  }, [values])

  const touch = useMemo<UseFormTouch>(() => {
    return name => {
      setFormState(state => ({
        ...state,
        touchedFields: {
          ...state.touchedFields,
          [name]: true,
        },
      }))
    }
  }, [])

  const isDirty = !!Object.values(formState.dirtyFields).find(v => v)
  const hasErrors = !!Object.values(formState.errors).find(v => !!v)
  const isValid = isDirty && !hasErrors

  return {
    getValues,
    setError,
    clearErrors,
    setValue,
    formState: {
      ...formState,
      isDirty,
      isValid,
    },
    reset,
    handleSubmit,
    touch,
  }
}

type Awaitable<T> = T | Promise<T>

type UseControllerRules = {
  required?: boolean
  min?: string | number
  max?: string | number
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  validate?: (value: any) => Awaitable<string | string[] | boolean | undefined>
}

export type UseControllerProps = {
  name?: string
  rules?: UseControllerRules
  defaultValue?: unknown
}

type UseControllerField = {
  onChange: (...event: any[]) => void
  onBlur: () => void
  value: any
  name: string
  ref: React.Ref<any>
}

type UseControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  isValidating: boolean
  error?: any
}

export type UseControllerResult = {
  field: UseControllerField
  fieldState: UseControllerFieldState
}

type UseController = (props: UseControllerProps) => UseControllerResult

export const useController: UseController = props => {
  const {
    name,
    rules,
  } = props

  const form = useContext(FormContext)
  if (!form) {
    throw new Error('form undefined')
  }

  const {
    getValues,
    setError,
    clearErrors,
    setValue,
    formState,
    touch,
  } = form

  const onChange = useMemo(() => {
    return (value: any) => {
      if (!name) {
        return
      }

      if (value?.target instanceof HTMLInputElement) {
        const event = value as React.ChangeEvent<HTMLInputElement>

        if (event.target.type === 'checkbox') {
          setValue(name, event.target.checked)
        } else {
          setValue(name, event.target.value)
        }
      } else {
        setValue(name, value)
      }
    }
  }, [setValue, name])

  const onBlur = useMemo(() => {
    return () => {
      if (!name) {
        return
      }

      touch(name)
    }
  }, [touch, name])

  const [value] = name ? getValues([name]) : []

  const field = {
    onChange,
    onBlur,
    value,
    name: name!,
    ref: { current: undefined },
  }

  const error = name ? formState.errors[name] : undefined
  const invalid = !!error
  const isDirty = name ? formState.dirtyFields[name] : false
  const isTouched = name ? formState.touchedFields[name] : false

  useEffect(() => {
    if (!name) {
      return
    }

    const oldError = error
    const newError = (() => {
      const {
        required,
        min,
        max,
        minLength,
        maxLength,
        pattern,
        validate,
      } = rules ?? {}

      if (required && !value) {
        return 'required'
      }

      if (min && value && typeof value === 'number' && value < min) {
        return 'min'
      }

      if (max && value && typeof value === 'number' && value > max) {
        return 'max'
      }

      if (minLength && value && typeof value === 'string' && value.length < minLength) {
        return 'minLength'
      }

      if (maxLength && value && typeof value === 'string' && value.length > maxLength) {
        return 'maxLength'
      }

      if (pattern && value && typeof value === 'string' && !pattern.test(value)) {
        return 'pattern'
      }

      if (validate) {
        return validate(value)
      }

      return undefined
    })()

    if (newError) {
      setError(name, newError)
    } else if (oldError) {
      clearErrors(name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, value, formState.resetCount])

  const fieldState = {
    invalid,
    isTouched,
    isDirty,
    isValidating: false,
    error,
  }

  return {
    field,
    fieldState,
  }
}
