import {apiSettings} from "../settings";
import {fetchJson} from "../utils";

export const loadRequiredResources = resources => dispatch => {
  let bundleUrl = `${apiSettings.endpoint}resources/?`;

  for (const requiredResource of resources) {
    bundleUrl += `names=${requiredResource}&`;
  }

  return fetchJson(bundleUrl).then(bundle => {
    dispatch({
      type: 'addBundle',
      apiResourceObjects: bundle
    });
  });
};