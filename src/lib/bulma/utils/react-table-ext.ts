import {
  Hooks as _Hooks,
  TableInstance as _TableInstance,
  TableOptions as _TableOptions,

  useGlobalFilter as _useGlobalFilter,

  usePagination as _usePagination,
  useRowSelect as _useRowSelect, useSortBy as _useSortBy, useTable as _useTable
} from 'react-table'

export type TableOptions<F> = F extends ((options: infer O) => any) ? O : {}

export type TableInstance<F> = F extends ((options: any) => infer I) ? I : {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Plugin<O, I, CO, CI, RO> = (hooks: _Hooks<any>) => void

export type PluginOptions<P> = P extends Plugin<infer O, any, any, any, any> ? O : {}

export type PluginInstance<P> = P extends Plugin<any, infer I, any, any, any> ? I : {}

export type PluginColumnOptions<P> = P extends Plugin<any, any, infer CO, any, any> ? CO : {}

export type PluginColumnInstance<P> = P extends Plugin<any, any, any, infer CI, any> ? CI : {}

export type PluginRowInstance<P> = P extends Plugin<any, any, any, any, infer R> ? R : {}

export const useGlobalFilter = _useGlobalFilter as Plugin<{
  initialState?: {
    globalFilter?: string
  }
  manualGlobalFilter?: boolean
  disableGlobalFilter?: boolean
  autoResetGlobalFilter?: boolean
}, {
  state: {
    globalFilter: string
  }
  setGlobalFilter: (globalFilter: string) => void
}, {
  disableGlobalFilter?: boolean
}, {

}, {

}>

export const useSortBy = _useSortBy as Plugin<{
  initialState?: {
    sortBy?: { id: string, desc?: boolean }[]
  }
  manualSortBy?: boolean
  disableSortBy?: boolean
  disableMultiSort?: boolean
  disableSortRemove?: boolean
  disableMultiRemove?: boolean
  autoResetSortBy?: boolean
}, {
  state: {
    sortBy: { id: string, desc: boolean }[]
  }
  toggleSortBy: (columnId: string, descending: boolean, isMulti?: boolean) => void
}, {
  disableSortBy?: boolean
  sortDescFirst?: boolean
  sortType?: (rowA: any, rowB: any, columnId: string, desc: boolean) => 1 | 0 | -1
}, {
  canSort: boolean
  toggleSortBy: (descending: boolean, multi?: boolean) => void
  getSortByToggleProps: (props?: any) => any
  clearSortBy: () => void
  isSorted: boolean
  sortedIndex: number
  isSortedDesc: boolean
}, {

}>

export const usePagination = _usePagination as Plugin<{
  initialState?: {
    pageSize?: number
    pageIndex?: number
  }
  pageCount: number | -1
  manualPagination?: boolean
  autoResetPage?: boolean
  paginateExpandedRows?: boolean
}, {
  state: {
    pageIndex: number
    pageSize: number
  }
  page: any[]
  pageCount: number | -1
  canPreviousPage: boolean
  canNextPage: boolean
  gotoPage: (pageIndex: number) => void
  previousPage: () => void
  nextPage: () => void
  setPageSize: (pageSize: number) => void
}, {

}, {

}, {

}>

export const useRowSelect = _useRowSelect as Plugin<{
  initialState?: {
    selectedRowIds?: Record<string, boolean>
  }
  manualRowSelectedKey?: string
  autoResetSelectedRows?: boolean
}, {
  toggleRowSelected: (rowPath: string, selected?: boolean) => void
  toggleAllRowsSelected: (selected?: boolean) => void
  toggleAllPageRowsSelected: (selected?: boolean) => void
  getToggleAllPageRowsSelectedProps: (props?: any) => any
  getToggleAllRowsSelectedProps: (props?: any) => any
  isAllRowsSelected: boolean
  selectedFlatRows: any[]
}, {

}, {

}, {
  isSelected: boolean
  isSomeSelected: boolean
  toggleRowSelected: (selected?: boolean) => void
  getToggleRowSelectedProps: (props?: any) => any
}>

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export const createUseTable = <P extends Record<string, Plugin<any, any, any, any, any>>>(plugins: P) => {
  type Column<D extends Record<string, any>> = _TableOptions<D>['columns'][number] & UnionToIntersection<PluginColumnOptions<P[keyof P]>>
  type Row<D extends Record<string, any>> = _TableInstance<D>['rows'][number] & UnionToIntersection<PluginRowInstance<P[keyof P]>>
  type Header<D extends Record<string, any>> = _TableInstance<D>['headerGroups'][number]['headers'][number] & UnionToIntersection<PluginColumnInstance<P[keyof P]>>
  type HeaderGroup<D extends Record<string, any>> = Omit<_TableInstance<D>['headerGroups'][number], 'headers'> & { headers: Header<D>[] }
  type Options<D extends Record<string, any>> = (_TableOptions<D> & PluginOptions<P[keyof P]>) & { columns: Column<D>[] }
  type Instance<D extends Record<string, any>> = (Omit<_TableInstance<D>, 'rows' | 'headerGroups'> & UnionToIntersection<PluginInstance<P[keyof P]>>) & { rows: Row<D>[], headerGroups: HeaderGroup<D>[] }

  return <D extends Record<string, any>>(options: Options<D>) => {
    return _useTable(options, ...Object.values(plugins)) as any as Instance<D>
  }
}
