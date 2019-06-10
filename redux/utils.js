import {apiSettings} from "../settings";
import {fetchJson} from "../utils";

export const fetchRequiredResources = resources => {
  let bundleUrl = `${apiSettings.endpoint}resources/?`;

  for (const requiredResource of resources) {
    bundleUrl += `names=${requiredResource}&`;
  }

  return fetchJson(bundleUrl)
};