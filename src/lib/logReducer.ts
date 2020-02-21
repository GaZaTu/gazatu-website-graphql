import { Reducer } from 'react'

const logReducer = <S, A>(reducer: Reducer<S, A>): Reducer<S, A> => {
  return (prevState, action) => {
    console.group(action)

    const nextState = reducer(prevState, action)

    if (nextState !== prevState) {
      console.log(prevState, '=>', nextState)
    }

    console.groupEnd()

    return nextState
  }
}

export default logReducer
