import { useParams } from 'react-router-dom'

const useIdParam = (props: any, paramKey = 'id', ifIsNew = '' as string | null) => {
  const params = useParams<{ [key: string]: any }>()
  const id = props[paramKey] ?? params[paramKey]

  return id === 'new' ? ifIsNew : id
}

export default useIdParam
