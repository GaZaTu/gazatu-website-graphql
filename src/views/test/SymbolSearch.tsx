import classNames from 'classnames'
import React from 'react'
import Table from '../../lib/bulma/Table'
import Tag from '../../lib/bulma/Tag'
import { HTMLProps } from '../../lib/bulma/utils/HTMLProps'
import './SymbolSearch.css'

type Filter = {
  id: string
  name: string
  active: boolean
}

type Symbol = {
  isin?: string
  symbol?: string
  description?: string
  type?: string
  href?: string
}

type Props = HTMLProps<'div'> & {
  search?: string
  onSearchChange?: (search: string) => unknown
  filters?: Filter[]
  onFilterChange?: (filter: Filter) => unknown
  loading?: boolean
  symbols?: Symbol[]
  onSymbolClick?: (symbol: Symbol) => unknown
}

const SymbolSearch: React.FC<Props> = props => {
  const {
    children,
    innerRef,
    search,
    onSearchChange,
    filters,
    onFilterChange,
    loading,
    symbols,
    onSymbolClick,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <Table data={symbols} fullwidth loading={loading} canClickRows onRowClick={row => onSymbolClick?.(row.original)} pagination={false} hasStickyToolbars={false} canSelectRows={false} canSortColumns={false} canHideColumns={false} manual initialState={{ globalFilter: search }} onFilterChange={onSearchChange}>
        {(filters && onFilterChange) && (
          <Table.Toolbar>
            <Tag.Group>
              {filters.map(filter => (
                <Tag as="a" key={filter.id} onClick={() => onFilterChange(filter)} round size="medium" color={filter.active ? 'primary' : undefined}>{filter.name}</Tag>
              ))}
            </Tag.Group>
          </Table.Toolbar>
        )}

        <Table.Column Header="SYMBOL" accessor="symbol" width="15%" />
        <Table.Column Header="DESCRIPTION" accessor="description" />
        <Table.Column Header="TYPE" accessor="type" width="15%" />
      </Table>
    </div>
  )
}

export default React.memo(SymbolSearch)
