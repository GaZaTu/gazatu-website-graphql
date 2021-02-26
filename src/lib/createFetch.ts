import React from 'react'

export const FetchContext = React.createContext({
  fetch: null as typeof fetch | null,
})

export const createFetch = (init1?: RequestInit) =>
  (input: RequestInfo, init2?: RequestInit) =>
    fetch(`${process.env.REACT_APP_API_URL}${input}`, {
      ...init1,
      ...init2,
      mode: 'cors',
      headers: {
        ...init1?.headers,
        ...init2?.headers,
      },
    })
