import { useState, useRef, useMemo, useLayoutEffect, useEffect } from 'react'

type Values = {
  [name: string]: any
}

type ValuesAs<V, T> = {
  [P in keyof V]: T
}

type Errors<V> = Partial<ValuesAs<V, string>>

type FormState<V> = {
  values: V
  errors: Errors<V>
  isValid: boolean
  isValidating: boolean
  isSubmitting: boolean
}

type Props<V extends Values> = {
  initialValues: V
  onSubmit: (values: V) => unknown | Promise<unknown>
  onValidate?: (values: V) => Errors<V> | Promise<Errors<V>>
}

const useForm = <V extends Values>(props: Props<V>) => {
  const { initialValues, onSubmit, onValidate } = props

  const form = useRef<HTMLFormElement | null>(null)

  const [combinedFormState, setCombinedFormState] = useState<FormState<V>>({
    values: initialValues,
    errors: {},
    isValid: false,
    isValidating: false,
    isSubmitting: false,
  })

  const { values, errors, ...formState } = combinedFormState

  const setValues = useMemo(() => {
    return (action: (values: V) => V) =>
      setCombinedFormState(state => ({ ...state, values: action(state.values) }))
  }, [setCombinedFormState])

  const setErrors = useMemo(() => {
    return (action: (errors: Errors<V>) => Errors<V>) =>
      setCombinedFormState(state => ({ ...state, errors: action(state.errors) }))
  }, [setCombinedFormState])

  const setFormStateProp = useMemo(() => {
    return <K extends keyof FormState<V>>(k: K, v: FormState<V>[K]) =>
      setCombinedFormState(state => ({ ...state, [k]: v }))
  }, [setCombinedFormState])

  const reset = useMemo(() => {
    return (values: V = initialValues) =>
      setValues(() => values)
  }, [setValues, initialValues])

  const validate = useMemo(() => {
    return async () => {
      let isValid = !!form.current?.checkValidity()

      if (onValidate) {
        let errors = onValidate(values)

        if (errors instanceof Promise) {
          setFormStateProp('isValidating', true)
          errors = await errors
          setFormStateProp('isValidating', false)
        }

        setErrors(() => errors as Errors<V>)

        isValid = isValid && !Object.values(errors).find(e => !!e)
      }

      setFormStateProp('isValid', isValid)
    }
  }, [onValidate, setFormStateProp, setErrors, values])

  useLayoutEffect(() => {
    validate()
  }, [validate])

  useEffect(() => {
    reset()
  }, [reset])

  const getValueByPath = (o: any, p: any) =>
    String(p).split('.').reduce((o, i) => o?.[i], o)

  const getValue = (p: any) =>
    getValueByPath(values, p)

  const getInitialValue = (p: any) =>
    getValueByPath(initialValues, p)

  const normalizeValueForState = <K extends keyof V>({ name, value }: { name: K, value: V[K] }) => {
    const initialValue = getInitialValue(name)

    if (value) {
      return value
    } else if (initialValue === null) {
      return null
    } else if (initialValue === undefined) {
      return undefined
    } else {
      return value
    }
  }

  const normalizeDateValueForState = (valueAsDate: Date | null, type: string) => {
    if (valueAsDate) {
      if (type === 'date') {
        return valueAsDate.toISOString().substr(0, 'xxxx-xx-xx'.length)
      } else if (type === 'time') {
        return valueAsDate.toISOString().substr('xxxx-xx-xxT'.length, 'xx:xx'.length)
      } else {
        return valueAsDate.toISOString()
      }
    } else {
      return valueAsDate
    }
  }

  const normalizeValueForInput = (value: any, type = 'text') => {
    if (typeof value === 'number') {
      return value
    } else if (typeof value === 'boolean') {
      return String(value)
    } else if (typeof value === 'string') {
      if (value.length === 0) {
        return value
      }

      if (type === 'date') {
        return new Date(value).toISOString().substr(0, 'xxxx-xx-xx'.length)
      } else if (type === 'time') {
        try {
          return new Date(value).toISOString().substr('xxxx-xx-xxT'.length, 'xx:xx'.length)
        } catch {
          return value
        }
      } else {
        return value
      }
    } else if (value instanceof Date) {
      if (type === 'date') {
        return value.toISOString().substr(0, 'xxxx-xx-xx'.length)
      } else if (type === 'time') {
        return value.toISOString().substr('xxxx-xx-xxT'.length, 'xx:xx'.length)
      } else {
        return value.toISOString()
      }
    } else {
      return ''
    }
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    setFormStateProp('isSubmitting', true)

    try {
      await onSubmit(values)
    } finally {
      setFormStateProp('isSubmitting', false)
    }
  }

  const handleReset = () =>
    reset()

  const handleChange = <K extends keyof V>({ name, value }: { name: K, value: V[K] }) =>
    setValues(values => {
      const nameAsString = String(name)
      const result = { ...values }

      if (nameAsString.includes('.')) {
        const pathParts = nameAsString.split('.')
        const parentObject = getValueByPath(result, pathParts.slice(0, -1).join('.'))

        if (typeof parentObject === 'object') {
          parentObject[pathParts.slice(-1).join('.')] = value
        }
      } else {
        result[name] = value
      }

      return result
    })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
    const { name, type, valueAsDate, valueAsNumber, value: valueAsString } = event.target
    const value = normalizeDateValueForState(valueAsDate, type) || valueAsNumber || normalizeValueForState({ name, value: valueAsString as any })

    handleChange({ name, value: value as any })
  }

  const inputProps = <K extends keyof V>(name: K, { type }: { type: string } = { type: 'text' }) => ({
    name,
    type,
    value: normalizeValueForInput(getValue(name), type),
    onChange: handleInputChange,
  })

  const checkboxProps = <K extends keyof V>(name: K) => ({
    name,
    type: 'checkbox' as 'checkbox',
    checked: !!getValue(name),
    onChange: () => handleChange({ name, value: !getValue(name) as any }),
  })

  const radioProps = <K extends keyof V>(name: K, value: Exclude<V[K], null>, getId?: (v: Exclude<V[K], null | undefined>) => string) => {
    const newValue = getId && value ? getId(value!) : value
    const savedValue = getId && getValue(name) ? getId(getValue(name)!) : getValue(name)

    return {
      name,
      type: 'radio' as 'radio',
      value: newValue ? String(newValue) : '',
      checked: newValue === savedValue,
      onChange: () => handleChange({ name, value }),
    }
  }

  const selectProps = <K extends keyof V>(name: K, data: Exclude<V[K], null>[], getId?: (v: Exclude<V[K], null | undefined>) => string) => {
    const savedValue = getId && getValue(name) ? getId(getValue(name)!) : getValue(name)

    return {
      name,
      value: savedValue ? String(savedValue) : '',
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value: valueAsString } = event.target
        const id = normalizeValueForState({ name, value: valueAsString as any })

        if (data) {
          handleChange({ name, value: getId ? data.find(v => getId(v!) === id) : data.find(v => v === id) as any })
        }
      },
    }
  }

  const controlProps = <K extends keyof V>(name: K) => ({
    value: getValue(name),
    onChange: (event: React.ChangeEvent<{ value: any }>) => handleChange({ name, value: event.target.value }),
  })

  const customControlProps = <K extends keyof V>(name: K) => ({
    value: getValue(name),
    onChange: (value: V[K]) => handleChange({ name, value }),
  })

  return {
    values,
    errors,
    formState: { ...formState, isSubmittable: formState.isValid && !formState.isValidating && !formState.isSubmitting },
    formProps: { ref: form, onSubmit: handleSubmit, onReset: handleReset },
    submit: handleSubmit,
    reset,
    inputProps,
    checkboxProps,
    radioProps,
    selectProps,
    controlProps,
    customControlProps,
  }
}

export default useForm
