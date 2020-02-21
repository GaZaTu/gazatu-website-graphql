import React from 'react'
import Form from '../Form'
import RadioGroup from '@material-ui/core/RadioGroup'

type FormRadioGroupProps = React.ComponentProps<typeof RadioGroup> & {
  name: string
  options: any[]
  optionId?: (o: any) => string
}

const FormRadioGroup: React.FC<FormRadioGroupProps> = props => {
  const { name, options, optionId, children, ...nativeProps } = props
  const { selectProps } = React.useContext(Form.Context)
  const selectPropsObject = selectProps(name, options, optionId)

  return (
    <RadioGroup {...nativeProps} {...selectPropsObject as any}>
      {children}
    </RadioGroup>
  )
}

export default React.memo(FormRadioGroup)
