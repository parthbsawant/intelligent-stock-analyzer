const AUTH_TOKEN_KEY = 'authToken'

export function loginUser(token = 'dummy-token') {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  return token
}

export function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
}

