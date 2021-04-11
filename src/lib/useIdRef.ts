import { useRef } from 'react'

const useIdRef = () => {
  return useRef(Math.random().toString(36).substr(2, 8)).current
}

export default useIdRef
