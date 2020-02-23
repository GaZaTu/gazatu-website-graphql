import React from 'react'
import MUIDataTable, { MUIDataTableProps, MUIDataTableColumn, MUIDataTableOptions, MUIDataTableColumnOptions } from 'mui-datatables'

interface AppTableColumnProps extends MUIDataTableColumn {
  children?: MUIDataTableColumnOptions['customBodyRender']
}

const AppTableColumn: React.FC<AppTableColumnProps> = () => {
  return (<></>)
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
    React.useMemo(() => (
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
              customBodyRender: columnProps.children || (columnProps.options && columnProps.options.customBodyRender),
              sortDirection: (sortField === columnProps.name) ? sortDirection!.toLowerCase() : undefined,
            },
          }
        })
        .filter((v: any) => v) as any[]
    ), [children, sortDirection, sortField])

  const options: MUIDataTableOptions = {
    filterType: 'textField',
    selectableRows: 'none',
    download: false,
    print: false,
    ...nativeProps.options,
  }

  return (
    <div className={`AppTable ${className}`}>
      <MUIDataTable {...nativeProps} columns={columns} options={options} />
    </div>
  )
}

export default Object.assign(React.memo(AppTable), {
  Column: AppTableColumn,
})
