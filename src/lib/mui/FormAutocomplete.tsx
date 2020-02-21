import React from 'react'
import Form from '../Form'
import Autocomplete, { AutocompleteProps } from '@material-ui/lab/Autocomplete'

type FormAutocompleteProps = AutocompleteProps<any> & {
  name: string
}

const FormAutocomplete: React.FC<FormAutocompleteProps> = props => {
  const { name, ...nativeProps } = props
  const { customControlProps } = React.useContext(Form.Context)
  const { value, onChange } = customControlProps(name)
  const handleChange = (e: any, value: any) => onChange(value)

  return (
    <Autocomplete {...nativeProps} value={value} onChange={handleChange} />
  )
}

export default React.memo(FormAutocomplete)
