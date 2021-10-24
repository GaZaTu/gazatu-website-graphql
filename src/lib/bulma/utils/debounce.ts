function debounce<T extends (...args: any[]) => void>(func: T, ms: number): T {
  let timeout = undefined as number | undefined

  return ((...args: any[]) => {
    const later = () => {
      timeout = undefined
      func.apply(undefined, args)
    }

    const callNow = false && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, ms) as any

    if (callNow) {
      func.apply(undefined, args)
    }
  }) as any
}

export default debounce
