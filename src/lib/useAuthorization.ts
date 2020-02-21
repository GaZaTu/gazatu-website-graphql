import { useState, useContext, useEffect } from 'react'
import { Store } from '../store'

type UseAuthorization = (...needed: string[]) => [boolean, React.ContextType<typeof Store>[0]['auth']]

const useAuthorization: UseAuthorization = (...needed) => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [store] = useContext(Store)

  useEffect(() => {
    if (!store.auth) {
      return setIsAuthorized(false)
    }

    const roles = store.auth.user.roles.map(r => r.name)

    for (const role of needed) {
      if (!roles.includes(role)) {
        return setIsAuthorized(false)
      }
    }

    return setIsAuthorized(true)
  }, [needed, store.auth])

  return [isAuthorized, store.auth]
}

export default useAuthorization
