import { Dispatch, SetStateAction, useContext, useMemo, useState } from 'react'
import A from './bulma/A'
import { createUseStoredState } from './useStoredState'
import useURLSearchParams, { QueryRecord } from './useURLSearchParams'

export const stringifyURLSearchParams = <T = QueryRecord>(object = {} as T) => {
  const query = new URLSearchParams(
    Object.entries(object)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  )

  return query.toString()
}

function useURLSearchParamsState<S extends {}>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
function useURLSearchParamsState<S extends {}>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
function useURLSearchParamsState<S extends {}>(initialState?: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const { useHistory, useLocation } = useContext(A.Context)
  const history = useHistory()
  const location = useLocation()

  const [defaultState] = useState(initialState)

  const state = useURLSearchParams<S>(location?.search)
  const setState = useMemo<Dispatch<SetStateAction<S>>>(() => {
    return (newState: any) => {
      if (typeof newState === 'function') {
        newState = newState(state)
      }

      if (defaultState) {
        for (const [key, defaultValue] of Object.entries(defaultState)) {
          if (newState[key] === defaultValue) {
            newState[key] = undefined
          }
        }
      }

      history?.replace(`?${stringifyURLSearchParams(newState)}`)
    }
  }, [history, state, defaultState])

  const stateWithDefaults = useMemo(() => {
    const stateWithDefaults = Object.assign({}, state)

    if (defaultState) {
      for (const [key, defaultValue] of Object.entries(defaultState)) {
        (stateWithDefaults as any)[key] = (stateWithDefaults as any)[key] ?? defaultValue

        if (typeof defaultValue === 'string') {
          (stateWithDefaults as any)[key] = String((stateWithDefaults as any)[key])
        }
      }
    }

    return stateWithDefaults
  }, [state, defaultState])

  return [stateWithDefaults, setState]
}

export default useURLSearchParamsState

export const useStoredURLSearchParamsState = createUseStoredState(useURLSearchParamsState)
