import { Dispatch } from 'react'

const createAction = <T extends string>(type: T) =>
  <A extends { type: string, payload: any }>(dispatch: Dispatch<A>) =>
    (payload: Extract<A, { type: T }>['payload']) =>
      dispatch({ type, payload } as any)

export default createAction
