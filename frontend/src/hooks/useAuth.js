import { useMemo, useState } from 'react'

function useAuth() {
  const [user, setUser] = useState(null)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: setUser,
      logout: () => setUser(null),
    }),
    [user],
  )

  return value
}

export default useAuth
