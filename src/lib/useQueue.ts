import React, { useContext, useEffect, useMemo, useState } from 'react'

const _Context = React.createContext({
  blocked: false,
  setBlocked: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
})
const _ContextProvider = _Context.Provider

const Provider: React.FC<{}> = props => {
  const { children } = props

  const [blocked, setBlocked] = useState(false)
  const value = {
    blocked,
    setBlocked,
  }

  return React.createElement(_ContextProvider, { value }, children)
}

export const QueueContext = Object.assign(_Context, {
  Provider,
})

const useQueue = (timeout = 25, disabled = false) => {
  const { blocked, setBlocked } = useContext(QueueContext)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (blocked || allowed || disabled) {
      return
    }

    setTimeout(() => {
      setBlocked(blocked => {
        if (blocked) {
          return true
        }

        setAllowed(true)

        if (timeout > 0) {
          setTimeout(() => {
            setBlocked(false)
          }, timeout)
        }

        return true
      })
    })
  }, [blocked, allowed, setBlocked, setAllowed, timeout, disabled])

  const onLoad = useMemo(() => {
    return () => {
      setBlocked(false)
    }
  }, [setBlocked])

  return [allowed, onLoad] as const
}

export default useQueue
