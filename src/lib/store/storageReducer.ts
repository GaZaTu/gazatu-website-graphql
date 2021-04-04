import { Reducer } from 'react'

const storageReducer = <S, A>(reducer: Reducer<S, A>, key: string, initialState: S): [Reducer<S, A>, () => S] => {
  return [
    (prevState, action) => {
      const nextState = reducer(prevState, action)

      if (nextState !== prevState) {
        if (nextState) {
          localStorage.setItem(key, JSON.stringify(nextState))
        } else {
          localStorage.removeItem(key)
        }
      }

      return nextState
    },
    () => {
      const json = localStorage.getItem(key)
      const data = json && JSON.parse(json)

      return data || initialState
    },
  ]
}

export default storageReducer
