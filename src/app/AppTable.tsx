import React, { useMemo } from 'react'
import MUIDataTable, { MUIDataTableProps, MUIDataTableColumn, MUIDataTableFooter, MUIDataTableColumnOptions } from 'mui-datatables'
import { Table as MuiTable, TablePagination } from '@material-ui/core'

interface AppTableColumnProps extends MUIDataTableColumn {
  children?: MUIDataTableColumnOptions['customBodyRender']
}

const AppTableColumn: React.FC<AppTableColumnProps> = props => {
  return (<></>)
}

interface AppTableFooterProps extends MUIDataTableFooter {}

const AppTableFooter: React.FC<AppTableFooterProps> = props => {
  const { rowCount, page, rowsPerPage, changeRowsPerPage, changePage } = props
  // const { customFooter, pagination = true } = options
  const pagination = true

  // const classes = useStyles()

  const handlePageChange = useMemo(() => {
    return (e: unknown, page: number) =>
      changePage!(page)
  }, [changePage])

  // if (customFooter) {
  //   return (
  //     <MuiTable className={classes.root}>
  //       {options.customFooter(
  //         rowCount,
  //         page,
  //         rowsPerPage,
  //         changeRowsPerPage,
  //         changePage,
  //         options.textLabels.pagination,
  //       )}
  //     </MuiTable>
  //   )
  // }

  if (pagination) {
    return (
      <MuiTable /* className={classes.root} */ className="AppTableFooter" >
        <TablePagination
          count={rowCount ?? 0}
          page={page ?? 0}
          rowsPerPage={rowsPerPage ?? 0}
          onRowsPerPageChange={changeRowsPerPage!}
          onPageChange={handlePageChange}
          // component="div"
          // options={options}
        />
      </MuiTable>
    )
  }

  return null
}

interface AppTableProps extends Omit<MUIDataTableProps, 'columns'> {
  children: React.ReactElement<AppTableColumnProps> | Array<React.ReactElement<AppTableColumnProps>> | React.ReactNode
  className?: string
  customOptions?: {
    sortField?: string
    sortDirection?: string
  }
}

const AppTable: React.FC<AppTableProps> = props => {
  const { children, className, customOptions, ...nativeProps } = props
  const { sortField, sortDirection } = customOptions || {}

  const columns =
    useMemo(() => (
      React.Children
        .map(children as any, child => {
          if (!child) {
            return null
          }

          const childAsElem = child as React.ReactElement<any>
          const columnProps = childAsElem.props as AppTableColumnProps

          return {
            ...columnProps,
            options: {
              ...columnProps.options,
              sort: sortField === columnProps.name,
              customBodyRender: columnProps.children || (columnProps.options && columnProps.options.customBodyRender),
            },
          }
        })
        .filter((v: any) => v) as any[]
    ), [children, sortField])

  const options: MUIDataTableProps['options'] = {
    filterType: 'textField',
    selectableRows: 'none',
    download: false,
    print: false,
    sortOrder: sortDirection?.toLowerCase() as any,
    ...nativeProps.options,
  }

  const components: MUIDataTableProps['components'] = {
    TableFooter: AppTableFooter,
  }

  return (
    <div className={`AppTable ${className}`}>
      <MUIDataTable {...nativeProps} columns={columns} options={options} components={components} />
    </div>
  )
}

export default Object.assign(React.memo(AppTable), {
  Column: AppTableColumn,
})
