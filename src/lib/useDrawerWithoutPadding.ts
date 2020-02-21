import { useContext, useLayoutEffect } from 'react'
import { Store } from '../store'

const useDrawerWithoutPadding = () => {
  const [, dispatch] = useContext(Store)

  useLayoutEffect(() => {
    const setUsePadding = (usePadding: boolean) =>
      dispatch({
        type: '@@DRAWER/SET_STATE',
        payload: { usePadding },
      })

    setUsePadding(false)

    return () => {
      setUsePadding(true)
    }
  }, [dispatch])
}

export default useDrawerWithoutPadding
