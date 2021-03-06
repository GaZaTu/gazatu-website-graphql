import classNames from 'classnames'
import React, { useContext, useLayoutEffect, useMemo, useState } from 'react'
import Control from './Control'
import Field from './Field'
import Form from './Form'
import Tag from './Tag'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type Props = Omit<HTMLProps<'div'>, 'onChange'> & {
  name?: string
  value?: string[]
  onChange?: (value: string[], info: { added: string } | { removed: string }) => void
  placeholder?: string
  pattern?: string
  required?: boolean
  // minTags?: number
  readOnly?: boolean
  // disabled?: boolean
  color?: Color
  onTagClick?: (event: React.MouseEvent<HTMLElement> & { tag: string }) => void
  getTagHref?: (tag: string) => string | undefined
}

const TagsInput: React.FC<Props> = props => {
  const {
    name,
    value: _value,
    onChange: _onChange,
    placeholder: _placeholder,
    pattern,
    required,
    // minTags,
    readOnly,
    // disabled,
    color: _color,
    onTagClick,
    getTagHref,
    children,
    innerRef: _innerRef,
    ...nativeProps
  } = props

  let color = _color

  let value = _value
  let onChange = _onChange
  let placeholder = _placeholder

  let innerRef = _innerRef

  const { setIsValidating } = useContext(Control.Context)

  const { label, setRequired, setError } = useContext(Field.Context)
  useLayoutEffect(() => setRequired(!!required), [setRequired, required])

  if (!placeholder && typeof label === 'string') {
    placeholder = `${label}...`
  }

  const { useController } = useContext(Form.Context)
  const controller = useController({
    name,
    rules: {
      required,
    },
  })

  if (controller) {
    const {
      field,
      fieldState: {
        isDirty,
        isTouched,
        invalid,
      },
    } = controller

    onChange = field.onChange
    nativeProps.onBlur = field.onBlur

    value = field.value

    innerRef = field.ref

    if ((isDirty || isTouched) && invalid) {
      color = 'danger'
    }
  }

  useLayoutEffect(() => {
    if (!controller?.fieldState) {
      return
    }

    const {
      error,
      isDirty,
      isTouched,
      isValidating,
    } = controller.fieldState

    setError((isDirty || isTouched) ? error : undefined)
    setIsValidating(isValidating)
  }, [controller?.fieldState, setError, setIsValidating])

  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)

  const className = classNames(nativeProps.className, {
    'tagsfield': true,
    'field': true,
    'input': true,
    'is-grouped': true,
    'is-grouped-multiline': true,
    'is-focused': !!focused,
    [`is-${color}`]: !!color,
    'show-placeholder': !value?.length && !inputValue.length,
  })

  const handleTagClick = useMemo(() => {
    return (event: React.MouseEvent<HTMLElement>) => {
      const tag = event.currentTarget.parentElement?.parentElement?.dataset?.tag!

      onTagClick?.(Object.assign(event, { tag }))
    }
  }, [onTagClick])

  const handleTagCrossClick = useMemo(() => {
    return (event: React.MouseEvent<HTMLElement>) => {
      const tag = event.currentTarget.parentElement?.parentElement?.dataset?.tag!

      onChange?.(value!.filter(t => t !== tag), { removed: tag })
    }
  }, [onChange, value])

  const handleInputChange = useMemo(() => {
    return (event: React.FormEvent<HTMLElement>) => {
      const parseInnerText = () => {
        const inputValue = event.currentTarget.innerText
        const newTag = inputValue.endsWith('\n') ? inputValue.trim() : undefined

        if (!newTag) {
          if (inputValue.trim() === '') {
            event.currentTarget.innerText = '\n'
          }

          return
        }

        event.currentTarget.innerText = '\n'

        if (value?.includes(newTag)) {
          return
        }

        if (pattern && !new RegExp(pattern).test(newTag)) {
          return
        }

        onChange?.([...(value ?? []), newTag], { added: newTag })
      }

      parseInnerText()
      setInputValue(event.currentTarget.innerText)
    }
  }, [onChange, value, pattern, setInputValue])

  const handleFocus = useMemo(() => {
    return () => {
      setFocused(true)
    }
  }, [setFocused])

  const handleBlur = useMemo(() => {
    return () => {
      setFocused(false)
    }
  }, [setFocused])

  return (
    <div {...nativeProps} ref={innerRef} className={className} style={{ marginBottom: 'unset' }}>
      {value?.map(tag => (
        <Control key={tag} data-tag={tag}>
          <Tag.Group hasAddons>
            <Tag as={(onTagClick || getTagHref) ? 'a' : 'span'} color="primary" onClick={handleTagClick} href={getTagHref?.(tag)}>{tag}</Tag>
            {!readOnly && (
              <Tag as="a" onClick={handleTagCrossClick} cross />
            )}
          </Tag.Group>
        </Control>
      ))}
      <div>
        <input type="hidden" value={value?.join(',') ?? ''} />
        <span autoCorrect="off" autoCapitalize="off" spellCheck="false" placeholder={placeholder} contentEditable={!readOnly} onInput={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} />
      </div>
    </div>
  )
}

export default React.memo(TagsInput)
