import React from 'react'
import useDocumentAndDrawerTitle from '../lib/useDocumentAndDrawerTitle'

const NotAuthenticatedView: React.FC = () => {
  useDocumentAndDrawerTitle('401')

  return (
    <p>Not Authenticated</p>
  )
}

export default NotAuthenticatedView
