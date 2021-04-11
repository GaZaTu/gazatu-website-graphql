import { useContext, useMemo } from 'react'
import { Store } from '.'

const useAuthorization = (...needed: string[]) => {
  const neededAsString = JSON.stringify(needed)

  const [store] = useContext(Store)
  const authorized = useMemo(() => {
    if (!store.auth) {
      return false
    }

    const roles = store.auth.user.roles.map(r => r.name)

    for (const role of needed) {
      if (!roles.includes(role)) {
        return false
      }
    }

    return true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.auth, neededAsString])

  return authorized
}

export default useAuthorization
