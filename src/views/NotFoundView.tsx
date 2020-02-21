import React from 'react'
import useDocumentAndDrawerTitle from '../lib/useDocumentAndDrawerTitle'

const NotFoundView: React.FC = () => {
  useDocumentAndDrawerTitle('404')

  return (
    <p>Not Found</p>
  )
}

export default NotFoundView
