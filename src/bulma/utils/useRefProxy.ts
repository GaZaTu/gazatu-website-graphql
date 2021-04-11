import { useRef } from 'react'
import { MutableRef } from './HTMLProps'

const useRefProxy = <T>(initialValue: T | null, innerRef?: MutableRef<T | null>) => {
  const ref = useRef(initialValue)
  const refProxy = new Proxy(ref, {
    set: (t, p, value) => {
      (t as any)[p] = value

      if (innerRef) {
        if (typeof innerRef === 'function') {
          innerRef(value)
        } else {
          innerRef.current = value
        }
      }

      return true
    },
  })

  return refProxy
}

export default useRefProxy
