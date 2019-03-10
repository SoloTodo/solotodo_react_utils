export function authTokenReducer(state, action) {
  if (typeof state === 'undefined') {
    return window.localStorage.getItem('authToken');
  }

  if (action.type === 'setAuthToken') {
    if (state !== action.authToken) {
      if (action.authToken) {
        window.localStorage.setItem('authToken', action.authToken)
      } else {
        window.localStorage.removeItem('authToken')
      }
    }
    return action.authToken
  }

  return state
}