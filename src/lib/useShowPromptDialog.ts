import { useContext, useRef, useMemo, useEffect } from 'react'
import { Store } from '../store'
import { State as DrawerState } from '../store/drawer'

const useShowPromptDialog = () => {
  const [{ drawer }, dispatch] = useContext(Store)
  const resolveRef = useRef<(button: string | null) => void>()

  const result = useMemo(() => {
    const showPromptDialog = (payload: Exclude<DrawerState['promptDialog'], undefined>) =>
      dispatch({ type: '@@DRAWER/SHOW_PROMPT_DIALOG', payload })

    return (payload: Parameters<typeof showPromptDialog>[0]) => {
      return new Promise<string | null>(resolve => {
        resolveRef.current = resolve
        showPromptDialog(payload)
      })
    }
  }, [dispatch])

  useEffect(() => {
    const hidePromptDialog = () =>
      dispatch({ type: '@@DRAWER/HIDE_PROMPT_DIALOG' })

    if (resolveRef.current && drawer.promptDialog?.clickedButton !== undefined) {
      resolveRef.current(drawer.promptDialog?.clickedButton)
      hidePromptDialog()
    }
  }, [dispatch, drawer.promptDialog])

  return result
}

export default useShowPromptDialog
