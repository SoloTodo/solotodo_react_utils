import {fetchRequiredResources} from "./utils";

export const loadRequiredResources = resources => dispatch => {
  return fetchRequiredResources(resources).then(bundle => {
    dispatch({
      type: 'addBundle',
      apiResourceObjects: bundle
    });
  });
};