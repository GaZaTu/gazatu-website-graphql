import React from 'react'
import Form from '../Form'
import Autocomplete, { AutocompleteProps } from '@material-ui/lab/Autocomplete'
import { UseAutocompleteSingleProps, UseAutocompleteMultipleProps } from '@material-ui/lab/useAutocomplete'

type FormAutocompleteProps<T = any> = ((AutocompleteProps<T> & UseAutocompleteSingleProps<T>) | (AutocompleteProps<T> & UseAutocompleteMultipleProps<T>)) & {
  name: string
}

const FormAutocomplete: React.FC<FormAutocompleteProps> = props => {
  const { name, ...nativeProps } = props
  const { customControlProps, selectProps } = React.useContext(Form.Context)
  const textfieldPropsObject = (() => {
    if (nativeProps.freeSolo || nativeProps.multiple) {
      const { value, onChange } = customControlProps(name)

      return {
        value,
        onChange: (e: any, value: any) => onChange(value),
      }
    } else {
      const { value, onChange } = selectProps(name, nativeProps.options!, nativeProps.getOptionLabel!)

      return {
        value,
        onChange: (e: any, value: any) => onChange({ target: { value: value && nativeProps.getOptionLabel!(value) } } as any),
      }
    }
  })()

  return (
    <Autocomplete {...nativeProps} {...textfieldPropsObject} />
  )
}

export default React.memo(FormAutocomplete)
