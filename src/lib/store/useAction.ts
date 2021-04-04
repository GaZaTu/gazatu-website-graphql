import { Dispatch, useMemo } from 'react'

const useAction = <A extends { type: string, payload?: any }, T extends A['type'], D extends Partial<Extract<A, { type: T }>['payload']>>(dispatch: Dispatch<A>, type: T, defaultPayload?: D) =>
  useMemo(() => {
    return (payload: Omit<Extract<A, { type: T }>['payload'], keyof D>) => {
      dispatch({ type, payload: { ...defaultPayload, ...payload } } as any)
    }
  }, [dispatch, type, ...Object.entries(defaultPayload ?? {}).flat()])

export default useAction
