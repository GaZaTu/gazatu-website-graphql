import React from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { IconButtonProps } from '@material-ui/core/IconButton'
import { useDropzone } from 'react-dropzone'

interface Props extends IconButtonProps {
  title?: string
  onUpload?: (acceptedFiles: File[]) => unknown
}

const UploadIconButton: React.FC<Props> = props => {
  const { children, title, onUpload, ...nativeProps } = props
  const { getRootProps, getInputProps } = useDropzone({ onDrop: onUpload })
  const rootProps = getRootProps()
  const { onClick: _onInputClick, ...inputProps } = getInputProps()

  return (
    <span {...rootProps}>
      <Tooltip title={title}>
        <IconButton {...nativeProps}>
          <input {...inputProps} />
          {children}
        </IconButton>
      </Tooltip>
    </span>
  )
}

export default UploadIconButton
