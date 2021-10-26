import classNames from 'classnames'
import React, { useContext, useEffect, useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import A from './A'
import Button from './Button'
import Control from './Control'
import Dropdown from './Dropdown'
import Icon from './Icon'
import Input from './Input'
import Level from './Level'
import Pagination from './Pagination'
import classes from './utils/classes'
import debounce from './utils/debounce'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'
import { createUseTable, TableInstance as _TableInstance, TableOptions as _TableOptions, useGlobalFilter, usePagination, useRowSelect, useSortBy } from './utils/react-table-ext'

export const tableIcons = {
  faSearch: undefined as any,
  faColumns: undefined as any,
  faCaretDown: undefined as any,
  faCaretUp: undefined as any,
}

export type TableSearchParams = {
  unusedQueryString?: string

  globalFilter?: string
  pageSize?: number
  pageIndex?: number
  sortBy?: [{ id: string, desc: boolean }]
}

export const useTableSearchParams = (storeStateInQuery = true) => {
  const { useLocation } = useContext(A.Context)
  const location = useLocation()

  const queryInitialState = useMemo(() => {
    if (!storeStateInQuery || !location?.search) {
      return {}
    }

    const result = {} as TableSearchParams
    const query = new URLSearchParams(location?.search)

    const q = query.get('q')
    const pS = query.get('pS')
    const pI = query.get('pI')
    const sC = query.get('sC')
    const sD = query.get('sD')

    if (q) {
      query.delete('q')

      result.globalFilter = q
    }

    if (pS && pI) {
      query.delete('pS')
      query.delete('pI')

      result.pageSize = Number(pS)
      result.pageIndex = Number(pI)
    }

    if (sC && sD) {
      query.delete('sC')
      query.delete('sD')

      result.sortBy = [{ id: sC, desc: sD === 'desc' }]
    }

    result.unusedQueryString = query.toString()
    return result
  }, [storeStateInQuery, location?.search])

  return queryInitialState
}

const useTable = createUseTable({
  useGlobalFilter,
  useSortBy,
  usePagination,
  useRowSelect,
  // useColumnOrder,
  // useResizeColumns,
})

export type TableOptions = _TableOptions<typeof useTable>
export type TableInstance = _TableInstance<typeof useTable>
export type TableProps = Props

type ToolbarProps = {
  columnsDropdownLeft?: boolean
}

const Toolbar: React.FC<ToolbarProps> = props => {
  return (
    <React.Fragment>
      {React.Children.map(props.children, child => (
        <Level.Item>
          {child}
        </Level.Item>
      ))}
    </React.Fragment>
  )
}

type ColumnProps = TableOptions['columns'][number]

const Column: React.FC<ColumnProps> = () => null

type Props = HTMLProps<'div'> & {
  options?: Partial<TableOptions>
  initialState?: Partial<TableOptions['initialState']>
  data?: any[]

  pagination?: boolean
  filter?: boolean
  hasStickyToolbars?: boolean
  canSelectRows?: boolean
  canClickRows?: boolean
  canSortColumns?: boolean
  canHideColumns?: boolean
  loading?: boolean
  storeStateInQuery?: boolean
  manual?: boolean

  onSelectedRowsChange?: (rows: TableInstance['rows']) => void
  onRowClick?: (row: TableInstance['rows'][number]) => void

  onFilterChange?: (filter: string) => void

  bordered?: boolean
  striped?: boolean
  narrow?: boolean
  hoverable?: boolean
  fullwidth?: boolean
}

const defaultColumns = [] as any[]
const defaultData = [] as any[]

const Table: React.FC<Props> = props => {
  const {
    children,
    options,
    initialState,
    data,

    pagination = true,
    filter = true,
    hasStickyToolbars = true,
    canSelectRows = true,
    canClickRows = false,
    canSortColumns = true,
    canHideColumns = true,
    loading,
    storeStateInQuery,
    manual,

    onSelectedRowsChange,
    onRowClick,

    onFilterChange,

    bordered,
    striped,
    narrow,
    hoverable = canClickRows,
    fullwidth,
    innerRef,
    ...nativeProps
  } = props

  const panelClassName = classNames(nativeProps.className, {
    'table-panel': true,
    'has-sticky-toolbars': !!hasStickyToolbars,
  })

  const tableClassName = classNames(undefined, {
    'table': true,
    'is-bordered': !!bordered,
    'is-striped': !!striped,
    'is-narrow': !!narrow,
    'is-hoverable': !!hoverable,
    'is-fullwidth': !!fullwidth,
  })

  const columns = useMemo(() => {
    return getChildrenByTypeAndProps(children, [Column], {})
      .map(child => ({
        width: undefined,
        minWidth: undefined,
        maxWidth: undefined,
        ...child.props,
      }))
  }, [children])

  const { useHistory } = useContext(A.Context)
  const history = useHistory()
  const queryInitialState = useTableSearchParams(storeStateInQuery ?? false)

  const {
    state: {
      pageIndex,
      pageSize,
      globalFilter,
      sortBy,
    },
    getTableProps,
    getTableBodyProps,
    flatHeaders,
    headerGroups,
    rows,
    prepareRow,
    getToggleAllPageRowsSelectedProps,
    page,
    pageCount,
    canPreviousPage,
    canNextPage,
    gotoPage,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable<{}>({
    manualGlobalFilter: manual,
    manualSortBy: manual,
    manualPagination: manual,
    ...options,
    initialState: {
      ...options?.initialState,
      ...initialState,
      ...queryInitialState,
    },
    columns: columns ?? defaultColumns,
    data: data ?? defaultData,
  })

  useEffect(() => {
    if (!storeStateInQuery || !history) {
      return
    }

    const query = new URLSearchParams()

    if (globalFilter) {
      query.set('q', globalFilter)
    }

    if (pageSize && pageIndex) {
      query.set('pS', String(pageSize))
      query.set('pI', String(pageIndex))
    }

    if (sortBy && sortBy.length === 1) {
      query.set('sC', sortBy[0].id)
      query.set('sD', sortBy[0].desc ? 'desc' : 'asc')
    }

    let tableQueryString = query.toString()
    let unusedQueryString = queryInitialState.unusedQueryString
    let queryString = '?'
    if (unusedQueryString) {
      queryString += unusedQueryString
    }
    if (tableQueryString) {
      queryString += `${queryString === '?' ? '' : '&'}${tableQueryString}`
    }

    history.replace(queryString)
  }, [storeStateInQuery, history, globalFilter, pageSize, pageIndex, sortBy, queryInitialState.unusedQueryString])

  useEffect(() => {
    if (!onFilterChange) {
      return
    }

    onFilterChange(globalFilter)
  }, [globalFilter, onFilterChange])

  const handleGlobalFilterChange = useMemo(() => {
    return debounce(e => {
      setGlobalFilter(e.target.value)
      gotoPage(0)
    }, 500)
  }, [setGlobalFilter, gotoPage])

  const toolbar = getChildrenByTypeAndProps(children, [Toolbar], {})[0]

  useEffect(() => {
    onSelectedRowsChange?.(selectedFlatRows)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSelectedRowsChange, selectedFlatRows.length])

  const isDesktop = useMediaQuery({ minWidth: '960px' })
  const getCellStyle = useMemo(() => {
    return (column: any) => {
      if (!isDesktop) {
        return {}
      }

      return {
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }
    }
  }, [isDesktop])

  return (
    <div {...getTableProps()} {...nativeProps} ref={innerRef} className={panelClassName}>
      {(filter || toolbar || canHideColumns) && (
        <div className="table-panel-toolbar">
          <Level className="is-flex-wrap-wrap pt-1" mobile>
            <Level.Left className={`${classes.spacing.mb2}`}>
              {filter && (
                <Level.Item>
                  <Control loading={loading}>
                    <Icon size="small" icon={tableIcons.faSearch} />
                    <Input type="text" defaultValue={globalFilter} onChange={handleGlobalFilterChange} style={{ width: '18rem' }} placeholder="Search..." rounded />
                  </Control>
                </Level.Item>
              )}
            </Level.Left>

            {(toolbar || canHideColumns) && (
              <Level.Right className={`${classes.spacing.mb2}`}>
                {toolbar}
                {canHideColumns && (
                  <Level.Item>
                    <Dropdown narrow right={isDesktop || !toolbar?.props?.columnsDropdownLeft}>
                      <Dropdown.Trigger>
                        <Button>
                          <Icon icon={tableIcons.faColumns} />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.Menu>
                        {flatHeaders
                          ?.filter?.(column => !column.id.includes('placeholder') && !column.columns)
                          ?.map?.(column => (
                            <Dropdown.Item as="div" key={column.id}>
                              <Control>
                                <Input type="checkbox" {...column.getToggleHiddenProps()}>{column.render('Header')}</Input>
                              </Control>
                            </Dropdown.Item>
                          ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Level.Item>
                )}
              </Level.Right>
            )}
          </Level>
        </div>
      )}
      <div className={`table-container ${classes.spacing.mt0} ${classes.spacing.mb0}`}>
        <table className={tableClassName}>
          <thead>
            {headerGroups.map((headerGroup, groupIndex) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {canSelectRows && (
                  <th className="table-select-column">
                    {(groupIndex === headerGroups.length - 1) && (
                      <Input {...getToggleAllPageRowsSelectedProps()} type="checkbox" indeterminate="false" />
                    )}
                  </th>
                )}
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} style={getCellStyle(column)}>
                    {canSortColumns && (
                      <Button color="link" kind="inverted" {...column.getSortByToggleProps()} labelized={!column.canSort || groupIndex !== headerGroups.length - 1}>
                        <span>
                          {column.render('Header')}
                        </span>
                        {column.isSorted && (
                          <Icon icon={column.isSortedDesc ? tableIcons.faCaretDown : tableIcons.faCaretUp} />
                        )}
                      </Button>
                    )}
                    {!canSortColumns && (
                      <span>
                        {column.render('Header')}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {(pagination ? (page as typeof rows) : rows).map(row => {
              prepareRow(row)

              return (
                <tr {...row.getRowProps(p => {
                  return {
                    ...p,
                    onClick: onRowClick && (() => onRowClick(row)),
                    style: {
                      ...p.style,
                      cursor: onRowClick && 'pointer',
                    },
                  }
                })}>
                  {canSelectRows && (
                    <td className="table-select-column">
                      <Input {...row.getToggleRowSelectedProps()} type="checkbox" indeterminate="false" />
                    </td>
                  )}
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} style={getCellStyle(cell.column)}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className={`table-panel-pagination ${classes.spacing.mt2}`}>
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            hasNext={canNextPage}
            hasPrev={canPreviousPage}
            onChangePage={gotoPage}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}

export default Object.assign(React.memo(Table), {
  Toolbar,
  Column,
})
