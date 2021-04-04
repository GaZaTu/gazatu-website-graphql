import React from 'react'

const createStore = <S, A>(reducer: React.Reducer<S, A>, initialState: S) => {
  const initialContextValue = [initialState, (() => { })] as [S, React.Dispatch<A>]
  const Context = React.createContext(initialContextValue)
  const ContextProvider = Context.Provider

  const Provider: React.FC<{}> = props => {
    const { children } = props
    const value = React.useReducer(reducer, initialState)

    return React.createElement(ContextProvider, { value }, children)
  }

  return Object.assign(Context, {
    Provider,
  })
}

export default createStore
