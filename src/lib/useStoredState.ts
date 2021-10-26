import { Dispatch, SetStateAction, useMemo, useState } from 'react'

export const createUseStoredState = (useStateX: typeof useState) => {
  function useStoredState<S = undefined>(key: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
  function useStoredState<S>(key: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
  function useStoredState<S>(key: string, initialState?: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
    const [state, setState] = useStateX<S>(() => {
      const storedStateJson = localStorage.getItem(key)
      const storedState = storedStateJson && JSON.parse(storedStateJson)

      if (storedState) {
        return storedState
      }

      if (initialState === undefined) {
        return undefined
      }

      if (typeof initialState === 'function') {
        return (initialState as (() => S))()
      } else {
        return initialState
      }
    })

    const setStateAndStore = useMemo<Dispatch<SetStateAction<S>>>(() => {
      return (setStateAction: any) => {
        const storeState = (state: any) => {
          if (state) {
            localStorage.setItem(key, JSON.stringify(state))
          } else {
            localStorage.removeItem(key)
          }
        }

        if (typeof setStateAction === 'function') {
          setState(prevState => {
            const nextState = setStateAction(prevState)
            storeState(nextState)
            return nextState
          })
        } else {
          storeState(setStateAction)
          setState(setStateAction)
        }
      }
    }, [key, setState])

    return [state, setStateAndStore]
  }

  return useStoredState
}

const useStoredState = createUseStoredState(useState)

export default useStoredState
