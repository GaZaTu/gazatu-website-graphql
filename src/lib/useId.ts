import { useRef } from 'react'

const useId = () => {
  return useRef(Math.random().toString(36).substr(2, 8))
}

export default useId
