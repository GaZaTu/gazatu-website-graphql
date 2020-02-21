import { Reducer } from 'react'

type ReducersMapObject<S, A> = {
  [K in keyof S]: Reducer<S[K], A>
}

type InferActionTypes<R> = R extends Reducer<any, infer A> ? A : any
type InferReducerTypes<T> = T extends Record<any, infer R> ? R : Reducer<any, any>
type InferStateType<T> = T extends ReducersMapObject<infer S, any> ? S : never

function combineReducers<T extends ReducersMapObject<any, any>>(
  reducers: T
): Reducer<InferStateType<T>, InferActionTypes<InferReducerTypes<T>>> {
  return (state, action) => {
    for (const [key, reducer] of Object.entries(reducers)) {
      const newKeyedState = reducer(state[key], action)

      if (newKeyedState !== state[key]) {
        return {
          ...state,
          [key]: newKeyedState,
        }
      }
    }

    return state
  }
}

export default combineReducers
