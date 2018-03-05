import omit from 'lodash/omit';

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

export function apiResourceObjectsReducer(state={}, action) {
  if (action.type === 'addApiResourceObjects' || action.type === 'addApiResource' || action.type === 'addBundle') {
    let newApiResourceObjects = {};
    for (const newApiResourceObject of action.apiResourceObjects) {
      newApiResourceObjects[newApiResourceObject.url] = newApiResourceObject
    }

    return {...state, ...newApiResourceObjects}
  }

  if (action.type === 'addApiResourceObject') {
    return {
      ...state,
      [action.apiResource.url]: action.apiResource
    }
  }

  if (action.type === 'updateApiResourceObject') {
    const previousValue = state[action.apiResourceObject.url];
    const newValue = {...previousValue, ...action.apiResourceObject};

    return {...state, ...{[action.apiResourceObject.url]: newValue}}
  }

  if (action.type === 'setAuthToken') {
    // User changed, delete all API resources that include permissions,
    // this includes the user itself
    let filteredResources = {...state};
    Object.values(state)
        .filter(x => Boolean(x.permissions))
        .map(x => delete filteredResources[x.url]);
    return filteredResources
  }

  if (action.type === 'deleteApiResourceObject') {
    return omit(state, [action.url])
  }

  return state
}

export function loadedResourcesReducer(state=[], action) {
  if (action.type === 'addApiResource') {
    return [...state, action.resource]
  }

  if (action.type === 'setAuthToken') {
    // If the user changes, invalidate the resources we may have fetched
    return []
  }

  return state
}

export function loadedBundleReducer(state=false, action) {
  if (action.type === 'addBundle') {
    return true
  }

  if (action.type === 'setAuthToken') {
    // If the user changes, invalidate the resources we may have fetched
    return false
  }

  return state
}