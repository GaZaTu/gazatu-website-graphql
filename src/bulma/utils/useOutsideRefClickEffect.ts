import React, { useEffect } from 'react'

const registeredHandlers = [] as { onClick: () => void, ref: React.RefObject<HTMLElement> }[]

const handleClick = (event: MouseEvent) => {
  for (const { onClick, ref } of registeredHandlers) {
    if (ref.current && !ref.current.contains(event.target as any)) {
      onClick()

      break
    }
  }
}

const useOutsideRefClickEffect = <T extends HTMLElement>(onClick: () => void, ref: React.RefObject<T>, active = true) => {
  useEffect(() => {
    if (!active) {
      return
    }

    const handler = { onClick, ref }

    registeredHandlers.unshift(handler)

    if (registeredHandlers.length === 1) {
      document.addEventListener('mousedown', handleClick)
    }

    return () => {
      registeredHandlers.splice(registeredHandlers.indexOf(handler), 1)

      if (registeredHandlers.length === 0) {
        document.removeEventListener('mousedown', handleClick)
      }
    }
  }, [onClick, ref, active])
}

export default useOutsideRefClickEffect
