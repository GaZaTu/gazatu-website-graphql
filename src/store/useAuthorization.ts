import { useContext, useEffect, useState } from 'react'
import { Store } from '.'

type UseAuthorization = (...needed: string[]) => [boolean, React.ContextType<typeof Store>[0]['auth']]

const useAuthorization: UseAuthorization = (...needed) => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [store] = useContext(Store)

  const neededAsString = JSON.stringify(needed)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.auth, neededAsString])

  return [isAuthorized, store.auth]
}

export default useAuthorization
