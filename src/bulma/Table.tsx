import classNames from 'classnames'
import React, { useMemo } from 'react'
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
import { createUseTable, TableOptions, useGlobalFilter, usePagination, useRowSelect, useSortBy } from './utils/react-table-ext'

const useTable = createUseTable({
  useGlobalFilter,
  useSortBy,
  usePagination,
  useRowSelect,
  // useColumnOrder,
  // useResizeColumns,
})

const Toolbar: React.FC<{}> = props => {
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

type ColumnProps = TableOptions<typeof useTable>['columns'][number]

const Column: React.FC<ColumnProps> = () => null

type Props = HTMLProps<'div'> & {
  options?: TableOptions<typeof useTable>
  initialState?: TableOptions<typeof useTable>['initialState']
  data?: any[]

  pagination?: boolean
  filter?: boolean
  hasStickyToolbars?: boolean
  canSelectRows?: boolean
  canHideColumns?: boolean
  loading?: boolean

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
    canHideColumns = true,
    loading,

    bordered,
    striped,
    narrow,
    hoverable,
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
      .map(child => child.props)
  }, [children])

  const {
    state: {
      pageIndex,
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
  } = useTable<{}>({
    ...options,
    initialState: {
      ...options?.initialState,
      ...initialState,
    },
    columns: columns ?? defaultColumns,
    data: data ?? defaultData,
  })

  const handleGlobalFilterChange = useMemo(() => {
    return debounce(e => setGlobalFilter(e.target.value), 500)
  }, [setGlobalFilter])

  const toolbar = getChildrenByTypeAndProps(children, [Toolbar], {})[0]

  return (
    <div {...getTableProps()} {...nativeProps} ref={innerRef} className={panelClassName}>
      {(filter || toolbar || canHideColumns) && (
        <div className="table-panel-toolbar">
          <Level className="is-flex-wrap-wrap pt-1" mobile>
            {filter && (
              <Level.Left className={`${classes.spacing.mb2}`}>
                <Level.Item>
                  <Control loading={loading}>
                    <Icon i="fas fa-search" />
                    <Input type="text" onChange={handleGlobalFilterChange} style={{ width: '22rem' }} placeholder="Search..." rounded />
                  </Control>
                </Level.Item>
              </Level.Left>
            )}
            {(toolbar || canHideColumns) && (
              <Level.Right className={`${classes.spacing.mb2}`}>
                {toolbar}
                {canHideColumns && (
                  <Level.Item>
                    <Dropdown narrow right>
                      <Dropdown.Trigger>
                        <Button>
                          <Icon i="fas fa-columns" />
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
                  <th {...column.getHeaderProps()}>
                    <Button color="link" kind="inverted" {...column.getSortByToggleProps()} labelized={!column.canSort || groupIndex !== headerGroups.length - 1}>
                      <span>
                        {column.render('Header')}
                      </span>
                      {column.isSorted && (
                        <Icon i={column.isSortedDesc ? 'fas fa-caret-down fa-lg' : 'fas fa-caret-up fa-lg'} />
                      )}
                    </Button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {(pagination ? (page as typeof rows) : rows).map(row => {
              prepareRow(row)

              return (
                <tr {...row.getRowProps()}>
                  {canSelectRows && (
                    <td className="table-select-column">
                      <Input {...row.getToggleRowSelectedProps()} type="checkbox" indeterminate="false" />
                    </td>
                  )}
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>
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
