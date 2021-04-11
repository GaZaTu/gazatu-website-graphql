import { useEffect } from 'react'

const useDocumentTitle = (title: string, disabled = false) => {
  const documentTitle = document.getElementsByTagName('title')[0]
  const previousTitle = documentTitle.innerText

  useEffect(() => {
    if (disabled || !title) {
      return
    }

    documentTitle.innerText = title

    return () => {
      documentTitle.innerText = previousTitle
    }
  }, [disabled, title, previousTitle, documentTitle])

  return title
}

export default useDocumentTitle
