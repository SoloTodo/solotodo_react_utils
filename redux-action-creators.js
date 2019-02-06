import {apiSettings} from "./settings";
import {fetchJson} from "./utils";

export const getBundle = resources => dispatch => {
  let url = `${apiSettings.endpoint}resources/?`;

  for (const requiredResource of resources) {
    url += `names=${requiredResource}&`;
  }

  return fetchJson(url).then(bundle => {
    dispatch({
      type: 'addBundle',
      apiResourceObjects: bundle,
    });

    // resolve(bundle);
  })
};