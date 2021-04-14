import classNames from 'classnames'
import React, { useContext, useMemo, useState } from 'react'
import Icon from './Icon'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

export const fileIcons = {
  faUpload: undefined as any,
}

type Props = HTMLProps<'input'> & {
  label?: string
  showFileName?: boolean
  onFilesChange?: (files: File[]) => void
  right?: boolean
  fullwidth?: boolean
  color?: Color
  size?: 'small' | 'normal' | 'medium' | 'large'
}

const FileInput: React.FC<Props> = props => {
  const {
    onChange,
    label,
    showFileName,
    onFilesChange,
    right,
    fullwidth,
    color,
    size,
    children,
    innerRef,
    ...nativeProps
  } = props

  const [fileName, setFileName] = useState('')
  const handleChange = useMemo(() => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.currentTarget
      const fileArray = [] as File[]
      for (let i = 0; i < (files?.length ?? 0); i++) {
        fileArray.push(files?.item(i)!)
      }

      onChange?.(event)
      onFilesChange?.(fileArray)
      setFileName(fileArray.join(', '))
    }
  }, [onChange, onFilesChange, setFileName])

  const inputClassName = classNames(nativeProps.className, {
    'file-input': true,
  })

  const className = classNames(undefined, {
    'file': true,
    'has-name': !!showFileName && !!fileName,
    'is-right': !!right,
    'is-fullwidth': !!fullwidth,
    [`is-${color}`]: !!color,
    [`is-${size}`]: !!size,
  })

  const { Icon: I } = useContext(Icon.Context)

  return (
    <div className={className}>
      <label className="file-label">
        <input {...nativeProps} ref={innerRef} className={inputClassName} type="file" onChange={handleChange} />
        <span className="file-cta" style={{ marginLeft: '0' }}>
          {I && (
            <span className="file-icon">
              <I icon={fileIcons.faUpload} />
            </span>
          )}
          {label && (
            <span className="file-label" style={{ marginLeft: '0.5em' }}>{label}</span>
          )}
        </span>
        {showFileName && (
          <span className="file-name">{fileName || '...'}</span>
        )}
      </label>
    </div>
  )
}

export default React.memo(FileInput)
