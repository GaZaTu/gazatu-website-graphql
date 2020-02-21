import { useContext, useLayoutEffect } from 'react'
import { Store } from '../store'

const useDrawerTitle = (title: string) => {
  const [store, dispatch] = useContext(Store)
  const previousTitle = store.drawer.title

  useLayoutEffect(() => {
    const setDrawerTitle = (title: string) =>
      dispatch({
        type: '@@DRAWER/SET_STATE',
        payload: { title },
      })

    setDrawerTitle(title)

    return () => {
      setDrawerTitle(previousTitle)
    }
  }, [title, dispatch, previousTitle, store.drawer.title])
}

export default useDrawerTitle
