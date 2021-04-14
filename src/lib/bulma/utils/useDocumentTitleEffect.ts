import { useEffect } from 'react'

const useDocumentTitleEffect = (title: string, disabled = false) => {
  useEffect(() => {
    const documentTitle = document.getElementsByTagName('title')[0]
    const previousTitle = documentTitle.innerText

    if (disabled || !title) {
      return
    }

    documentTitle.innerText = title

    return () => {
      documentTitle.innerText = previousTitle
    }
  }, [disabled, title])
}

export default useDocumentTitleEffect
