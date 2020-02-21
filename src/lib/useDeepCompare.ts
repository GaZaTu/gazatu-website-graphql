import { useRef } from 'react'

function useDeepCompare<T>(value: T) {
  const latestValue = useRef(value)

  if (JSON.stringify(latestValue.current) !== JSON.stringify(value)) {
    latestValue.current = value
  }

  return latestValue.current
}

export default useDeepCompare
