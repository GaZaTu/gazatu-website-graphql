import { useMemo } from 'react'

export type QueryRecord = Record<string, string | number | boolean | undefined>

export const parseURLSearchParams = <T = QueryRecord>(queryString = '') => {
  const object = {} as T
  const query = new URLSearchParams(queryString)

  for (const [key, valueAsString] of query.entries()) {
    const value = (() => {
      if (valueAsString === '') {
        return ''
      } else if (valueAsString === 'true') {
        return true
      } else if (valueAsString === 'false') {
        return false
      } else if (!isNaN(Number(valueAsString))) {
        return Number(valueAsString)
      } else {
        return valueAsString
      }
    })()

    ; (object as any)[key] = value
  }

  return object
}

const useURLSearchParams = <T = QueryRecord>(queryString = '') => {
  return useMemo(() => {
    return parseURLSearchParams<T>(queryString)
  }, [queryString])
}

export default useURLSearchParams
