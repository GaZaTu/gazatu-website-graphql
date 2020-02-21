function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout = undefined as number | undefined

  return ((...args: any[]) => {
    const later = () => {
      timeout = undefined
      func.apply(undefined, args)
    }

    const callNow = false && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait) as any

    if (callNow) {
      func.apply(undefined, args)
    }
  }) as any
}

export default debounce
