import { useEffect, useMemo, useState } from 'react'

const useIntersectionObserver = (element: HTMLElement | null, options?: { once?: boolean }) => {
  const { once } = options ?? {}

  const [isIntersecting, setIsIntersecting] = useState(false)

  const observer = useMemo(() => {
    return new IntersectionObserver(([entry], observer) => {
      setIsIntersecting(entry.isIntersecting)

      if (once && entry.isIntersecting) {
        observer.disconnect()
      }
    })
  }, [once])

  useEffect(() => {
    if (!element) {
      return
    }

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [observer, element])

  return isIntersecting
}

export default useIntersectionObserver
