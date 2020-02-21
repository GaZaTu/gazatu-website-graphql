import { useEffect } from 'react'

const useDocumentTitle = (title: string) => {
  const documentTitle = document.getElementsByTagName('title')[0]
  const previousTitle = documentTitle.innerText

  useEffect(() => {
    documentTitle.innerText = title

    return () => {
      documentTitle.innerText = previousTitle
    }
  }, [title, previousTitle, documentTitle.innerText])

  return title
}

export default useDocumentTitle
