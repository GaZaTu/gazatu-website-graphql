import { Dispatch, useMemo } from 'react'

const useAction = <A extends { type: string, payload?: any }, T extends A['type'], D extends Partial<Extract<A, { type: T }>['payload']>>(dispatch: Dispatch<A>, type: T, defaultPayload?: D) => {
  const defaultPayloadAsArray = Object.entries(defaultPayload ?? {}).flat()
  const action = useMemo(() => {
    return (payload: Omit<Extract<A, { type: T }>['payload'], keyof D>) => {
      dispatch({ type, payload: { ...defaultPayload, ...payload } } as any)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, type, ...defaultPayloadAsArray])

  return action
}

export default useAction
