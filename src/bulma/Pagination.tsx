/* eslint-disable jsx-a11y/anchor-is-valid */

import classNames from 'classnames'
import React, { useMemo } from 'react'
import Button from './Button'
import Control from './Control'
import Dropdown from './Dropdown'
import Field from './Field'
import Input from './Input'
import { HTMLProps } from './utils/HTMLProps'

type Props = HTMLProps<'nav'> & {
  firstIndex?: 0 | 1
  pageIndex: number
  pageCount?: number
  onChangePage?: (pageIndex: number) => void
  hasNext?: boolean
  hasPrev?: boolean
  centered?: boolean
  loading?: boolean
}

const Pagination: React.FC<Props> = props => {
  const {
    firstIndex = 0,
    pageIndex,
    pageCount: __pageCount,
    onChangePage,
    hasNext: _hasNext,
    hasPrev: _hasPrev,
    centered,
    loading,
    children,
    innerRef,
    ...nativeProps
  } = props

  const _pageCount = __pageCount ? (__pageCount + firstIndex) : undefined
  const hasPrev = _hasPrev ?? (_pageCount ? pageIndex > firstIndex : false)
  const hasNext = _hasNext ?? (_pageCount ? pageIndex < (_pageCount - 1) : false)
  const pageCount = _pageCount ?? (pageIndex + 1 + (hasNext ? 1 : 0))
  const lastIndex = pageCount - 1

  const className = classNames(nativeProps.className, {
    'pagination': true,
    'is-centered': !!centered,
    'is-loading': !!loading,
  })

  const paginationIndexes = [] as number[]
  for (let i = firstIndex; i < pageCount; i++) {
    if (i === firstIndex) {
      paginationIndexes.push(i)
    } else if (i === pageIndex - 1) {
      if ((i - firstIndex) > 1) {
        paginationIndexes.push(-666)
      }

      paginationIndexes.push(i)
    } else if (i === pageIndex) {
      paginationIndexes.push(i)
    } else if (i === pageIndex + 1) {
      paginationIndexes.push(i)
    } else if (i === pageCount - 1) {
      if ((i - pageIndex + 1) > 1) {
        paginationIndexes.push(-666)
      }

      paginationIndexes.push(i)
    }
  }

  const indexLabelNumber = (index: number) =>
    index + (firstIndex === 0 ? 1 : 0)

  const paginationLabels = [] as [number, string][]
  for (const index of paginationIndexes) {
    paginationLabels.push([index, String(indexLabelNumber(index))])
  }

  const handleClick = useMemo(() => {
    return (event: React.MouseEvent<HTMLElement>) => {
      onChangePage?.(Number(event.currentTarget.dataset.page))
    }
  }, [onChangePage])

  return (
    <nav {...nativeProps} ref={innerRef} className={className} role="navigation">
      <a className="pagination-previous" data-page={pageIndex - 1} onClick={handleClick} {...{ disabled: !hasPrev }}>Prev</a>
      <a className="pagination-next" data-page={pageIndex + 1} onClick={handleClick} {...{ disabled: !hasNext }}>Next</a>
      <ul className="pagination-list">
        {paginationLabels.map(([index, label], i) => (
          <li key={i}>
            {(() => {
              if (index < 0) {
                return (
                  <span className="pagination-ellipsis">&hellip;</span>
                )
              } else {
                const isCurrent = index === pageIndex
                const element = (
                  <a className={`pagination-link ${isCurrent ? 'is-current' : ''}`} data-page={index} onClick={handleClick}>{label}</a>
                )

                if (isCurrent) {
                  return (
                    <Dropdown narrow disabled>
                      <Dropdown.Trigger>
                        {element}
                      </Dropdown.Trigger>
                      <Dropdown.Menu style={{ width: '250px' }}>
                        <Dropdown.Item as="div">
                          <Field hasAddons>
                            <Control>
                              <Input type="number" defaultValue={indexLabelNumber(pageIndex)} min={1} max={lastIndex} />
                            </Control>
                            <Control>
                              <Button>Change</Button>
                            </Control>
                          </Field>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )
                } else {
                  return element
                }
              }
            })()}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default React.memo(Pagination)
