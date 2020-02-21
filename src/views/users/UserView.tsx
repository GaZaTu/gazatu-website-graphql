import React from 'react'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'

interface Props {
  id: string
}

const UserView: React.FC<Props> = () => {
  useDocumentAndDrawerTitle('User')

  return (<></>)
}

export default UserView
