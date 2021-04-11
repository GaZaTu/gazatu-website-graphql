import { Dispatch, SetStateAction, useMemo, useState } from 'react'

function useStoredState<S = undefined>(key: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
function useStoredState<S>(key: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
function useStoredState<S>(key: string, initialState?: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
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
      if (typeof setStateAction === 'function') {
        setState(prevState => {
          const nextState = setStateAction(prevState)

          if (nextState) {
            localStorage.setItem(key, JSON.stringify(nextState))
          } else {
            localStorage.removeItem(key)
          }

          return nextState
        })
      } else {
        if (setStateAction) {
          localStorage.setItem(key, JSON.stringify(setStateAction))
        } else {
          localStorage.removeItem(key)
        }

        setState(setStateAction)
      }
    }
  }, [key, setState])

  return [state, setStateAndStore]
}

export default useStoredState
