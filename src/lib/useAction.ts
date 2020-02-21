import { Dispatch, useMemo } from 'react'

const useAction = <A, R>(action: (dispatch: Dispatch<A>) => R, dispatch: Dispatch<A>) =>
  useMemo(() => action(dispatch), [dispatch])

export default useAction
