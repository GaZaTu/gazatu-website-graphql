import React from 'react'
import useDocumentAndDrawerTitle from '../lib/useDocumentAndDrawerTitle'

const NotAuthorizedView: React.FC = () => {
  useDocumentAndDrawerTitle('403')

  return (
    <p>Not Authorized</p>
  )
}

export default NotAuthorizedView
