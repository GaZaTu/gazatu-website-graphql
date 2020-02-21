import useDocumentTitle from './useDocumentTitle'
import useDrawerTitle from './useDrawerTitle'

const useDocumentAndDrawerTitle = (title: string) => {
  useDocumentTitle(title)
  useDrawerTitle(title)
}

export default useDocumentAndDrawerTitle
