import { apiSettings } from "./settings"
import {camelize, fetchAuth} from './utils';

export function filterApiResourceObjectsByType(apiResourceObjects, resource) {
  const apiResourceEndpoint = apiSettings.apiResourceEndpoints[resource];
  return Object.values(apiResourceObjects).filter(x => x.url.startsWith(apiResourceEndpoint))
}

export function fetchApiResource(resource, dispatch, authToken=null) {
  const resourceUrl = apiSettings.apiResourceEndpoints[resource];

  return fetchAuth(authToken, resourceUrl).then(json => {
    dispatch({
      type: 'addApiResource',
      apiResourceObjects: json,
      resource: resource,
    });
    return json;
  })
}

export function fetchApiResourceObject(resource, id, dispatch, authToken) {
  const apiResourceObjectUrl = `${apiSettings.apiResourceEndpoints[resource]}${id}/`;

  return fetchAuth(authToken, apiResourceObjectUrl).then(json => {
    if (json.url) {
      dispatch({
        type: 'addApiResourceObject',
        apiResource: json
      });
    } else {
      dispatch({
        type: 'deleteApiResourceObject',
        url: apiResourceObjectUrl
      })
    }
    return json;
  })
}

export function apiResourceObjectForeignKey(rawApiResource, field, state) {
  return state.apiResourceObjects[rawApiResource[field]]
}

export function apiResourceStateToPropsUtils(state) {
  return {
    authToken: state.authToken,
    ApiResourceObject: (jsonData) => {
      return new ApiResourceObject(jsonData, state.apiResourceObjects)
    },
    fetchAuth: (input, init={}) => {
      return fetchAuth(state.authToken, input, init);
    },
    fetchApiResource: (resource, dispatch, authToken=state.authToken) => {
      return fetchApiResource(resource, dispatch, authToken)
    },
    fetchApiResourceObject: (resource, id, dispatch) => {
      return fetchApiResourceObject(resource, id, dispatch, state.authToken)
    },
    filterApiResourceObjectsByType: resource => {
      return filterApiResourceObjectsByType(state.apiResourceObjects, resource)
    },
  };
}

export function addApiResourceStateToPropsUtils(mapStateToProps=null) {
  return (state, ownProps) => {
    const apiResourceProps = apiResourceStateToPropsUtils(state);

    if (mapStateToProps !== null) {
      return {
        ...apiResourceProps,
        ...mapStateToProps(state, ownProps)
      }
    } else {
      return apiResourceProps
    }
  }
}

export class ApiResourceObject {
  constructor(jsonData, apiResourceObjects) {
    this.apiResourceObjects = apiResourceObjects;
    this.dirtyFields = [];

    let properties = {};

    for (let entry in jsonData) {
      if (jsonData.hasOwnProperty(entry)) {
        let camelizedEntry = camelize(entry);
        if (entry !== 'url' && jsonData[entry] && jsonData[entry].includes && jsonData[entry].includes(apiSettings.endpoint)) {
          this[camelizedEntry + 'Url'] = jsonData[entry];
          properties[camelizedEntry] = this.createApiResourceForeignKeyProperty(entry)
        } else {
          // The property is a primitive value OR is a originally null valued ForeignKey
          properties[camelizedEntry] = {
            get: () => {
              return jsonData[entry];
            },
            set: (value) => {
              // Check whether this was originally a null value foreign key
              if (value && value.url) {
                // Yup, the field was originally a null value, modify the object
                let newProperties = {
                  [camelizedEntry]: this.createApiResourceForeignKeyProperty(entry)
                };
                Object.defineProperties(this, newProperties);
                this[camelizedEntry] = value
              } else {
                jsonData[entry] = value
              }

              this.dirtyFields.push(entry);
            },
            configurable: true
          }
        }
      }
    }

    Object.defineProperties(this, properties);
  }

  createApiResourceForeignKeyProperty(entry) {
    let camelizedEntry = camelize(entry);

    return {
      get: () => {
        const foreignKeyValue = this.apiResourceObjects[this[camelizedEntry + 'Url']];
        if (this[camelizedEntry + 'Url'] && !foreignKeyValue) {
          throw Object({
            name: 'Invalid ApiResourceLookup',
            object: this,
            field: camelizedEntry
          })
        }
        return new ApiResourceObject(foreignKeyValue, this.apiResourceObjects);
      },
      set: (value) => {
        this.dirtyFields.push(entry);
        this[camelizedEntry + 'Url'] = value.url;
      },
      configurable: true
    }
  }

  save(authToken, dispatch) {
    if (!this.dirtyFields.length) {
      return;
    }

    let payload = {};

    for (let dirtyField of this.dirtyFields) {
      let camelizedField = camelize(dirtyField);

      let value = this[camelizedField];
      if (value && value.url) {
        value = value.url
      }

      payload[dirtyField] = value;
    }

    this.dirtyFields = [];

    return fetchAuth(authToken, this.url, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }).then(json => {
      dispatch({
        type: 'updateApiResourceObject',
        apiResourceObject: json
      });
    });
  }
}