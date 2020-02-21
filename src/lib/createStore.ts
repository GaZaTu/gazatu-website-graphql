import React from 'react'

function createStore<S, A>(reducer: React.Reducer<S, A>, initialState: S) {
  const initialContextValue = [initialState, (() => { })] as [S, React.Dispatch<A>]
  const Context = React.createContext(initialContextValue)

  return {
    Context,
    Provider: (props: { children?: React.ReactNode }) => {
      const { children } = props
      const value = React.useReducer(reducer, initialState)

      return React.createElement(Context.Provider, { value }, children)
    },
  }
}

export default createStore
