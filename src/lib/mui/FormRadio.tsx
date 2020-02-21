import React from 'react'
import Form from '../Form'
import Radio from '@material-ui/core/Radio'

type FormRadioProps = React.ComponentProps<typeof Radio> & {
  name: string
  option?: any
  optionId?: (o: any) => string
}

const FormRadio: React.FC<FormRadioProps> = props => {
  const { name, option, optionId, children, ...nativeProps } = props
  const { radioProps } = React.useContext(Form.Context)
  const radioPropsObject = radioProps(name, option, optionId)

  return (
    <Radio {...nativeProps} {...radioPropsObject as any}>
      {children}
    </Radio>
  )
}

export default React.memo(FormRadio)
