import {apiSettings} from './settings';
import Big from 'big.js';
import moment from 'moment';
import {parseCookies} from "nookies";
import fetch from 'isomorphic-unfetch'
import locale_es from "moment/locale/es";
import {fetchApiResource, filterApiResourceObjectsByType} from "./ApiResource";


export const getAuthToken = ctx => {
  return parseCookies(ctx)['authToken'];
};

// REF: https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
export function camelize(str) {
  return str.replace(/_([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}

export function fetchJson(input, init = {}) {
  return fetchAuth(null, input, init);
}

export function fetchAuth(authToken, input, init = {}) {
  if (!input.includes(apiSettings.endpoint)) {
    input = apiSettings.endpoint + input
  }
  if (!init.headers) {
    init.headers = {}
  }

  if (authToken) {
    init.headers.Authorization = `Token ${authToken}`;
  }

  if (init.headers['Content-Type'] === null) {
    delete init.headers['Content-Type']
  } else if (typeof(init.headers['Content-Type'] === 'undefined')) {
    init.headers['Content-Type'] = 'application/json';
  }

  init.headers['Accept'] = 'application/json';

  return fetch(input, init).then(res => {
    if (!res.ok) {
      throw res
    }

    if (res.status === 204) {
      return res
    } else {
      return res.json()
    }
  })
}

export function navigatorLanguage() {
  // Define user's language. Different browsers have the user locale defined
  // on different fields on the `navigator` object, so we make sure to account
  // for these different by checking all of them
  const language = (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage;

  return language.toLowerCase().split(/[_-]+/)[0];
}


export function formatDateStr(timestampStr) {
  const dateObj = moment(timestampStr);
  return dateObj.format('llll')
}

export function formatCurrency(value, valueCurrency, conversionCurrency, thousandsSeparator, decimalSeparator) {
  if (typeof value === 'undefined' || value === null || Number.isNaN(value)) {
    return ''
  }

  let formattingCurrency = valueCurrency;

  if (conversionCurrency && (valueCurrency.url !== conversionCurrency.url)) {
    value *= new Big(conversionCurrency.exchangeRate) / new Big(valueCurrency.exchangeRate);
    formattingCurrency = conversionCurrency
  }

  const decimalPlaces = formattingCurrency.decimalPlaces;
  const prefix = formattingCurrency.prefix;
  const decimalValue = new Big(value);

  return prefix + ' ' + _formatCurrency(decimalValue, decimalPlaces, 3, thousandsSeparator, decimalSeparator);
}

export function convertToDecimal(value) {
  if (typeof value === 'undefined') {
    return undefined
  }

  if (value === null) {
    return null
  }

  return new Big(value)
}

export function setLocale(locale) {
  const localesDict = {
    'es': locale_es,
    'en': null
  };

  if (typeof localesDict[locale] === 'undefined') {
    console.warn('Using unsupported locale: ' + locale);
  }

  moment.locale(locale)
}

/**
 * @param value: Value to format
 * @param n: length of decimal
 * @param x: length of whole part
 * @param s: sections delimiter
 * @param c: decimal delimiter
 */
export function _formatCurrency(value, n, x, s, c) {
  const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = value.toFixed(Math.max(0, ~~n));

  return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
}

export function listToObject(list, key = 'id') {
  const result = {};

  for (const item of list) {
    result[item[key]] = item
  }

  return result
}

export function parseBig(value) {
  if (value === null) {
    return null
  }

  return new Big(value)
}

export function fillTimeLapse(dataset, startDate, endDate, dateField, valueField, emptyValue) {
  const valuesDict = {};

  for (const dataPoint of dataset) {
    valuesDict[dataPoint[dateField]] = dataPoint[valueField]
  }

  const result = [];

  const iterDate = moment(startDate);
  while (iterDate <= endDate) {
    let entryValue = valuesDict[iterDate];
    if (typeof(entryValue) === 'undefined') {
      entryValue = emptyValue
    }

    result.push({
      date: moment(iterDate),
      [valueField]: entryValue
    });

    iterDate.add(1, 'days')
  }

  return result;
}

const offset = moment().utcOffset();

export function parseDateToCurrentTz(dateStr) {
  /* Handle all the dates using the CURRENT timezone of the browser
   * This is different than just calling moment(dateStr) because moment()
   * handles DST, so if two dates are in different DST then they have a 1 hour
   * offset */
  return moment(dateStr).utcOffset(offset, true);
}

export function loadResources(requiredResources, store, callback) {
  const apiResourceObjects = {};

  for (let resource of requiredResources) {
    fetchApiResource(resource, store.dispatch)
      .then((apiResourceObjectList) => {
        const state = store.getState();

        for (const apiResourceObject of apiResourceObjectList) {
          apiResourceObjects[apiResourceObject.url] = apiResourceObject
        }

        if (requiredResources.every(resource => filterApiResourceObjectsByType(apiResourceObjects, resource).length)) {
          callback(
            state.authToken,
            store.dispatch,
            apiResourceObjects
          )
        }
      })
  }
}

export function areObjectsEqual(objA, objB, valueField='url') {
  const objAValue = objA ? objA[valueField] : null;
  const objBValue = objB ? objB[valueField] : null;

  return objAValue === objBValue;
}

export function areObjectListsEqual(listA, listB, valueField='url') {
  if (listA === null && listB === null) {
    return true;
  }

  if (typeof(listA) === 'undefined' && typeof(listB) === 'undefined') {
    return true;
  }

  if (typeof(listA) !== typeof(listB)) {
    return false
  }

  if (listA === null && listB !== null) {
    return false
  }

  if (listA !== null && listB === null) {
    return false
  }

  if (listA.length !== listB.length) {
    return false
  }

  for (let i = 0; i < listA.length; i++) {
    if (listA[i][valueField] !== listB[i][valueField]) {
      return false;
    }
  }

  return true;
}

export function areValuesEqual(valueA, valueB, valueField='url') {
  if (typeof(valueA) !== typeof(valueB)) {
    return false;
  } else if (Array.isArray(valueA)) {
    return areObjectListsEqual(valueA, valueB, valueField)
  } else {
    return areObjectsEqual(valueA, valueB, valueField)
  }
}

export function registerLead(authToken, websiteId, entity, uuid) {
  const requestBody = {
    website: websiteId
  };

  if (uuid) {
    requestBody['uuid'] = uuid
  }

  return fetchAuth(
    authToken,
    `entities/${entity.id}/register_lead/`,
    {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
}

export function areListsEqual(listA, listB) {
  if (listA === null && listB === null) {
    return true;
  }

  if ((listA === null && listB !== null) || (listA !== null && listB === null)) {
    return false
  }

  if (typeof(listA) !== typeof(listB)) {
    return false
  }

  if (listA.length !== listB.length) {
    return false
  }

  for (let i = 0; i < listA.length; i++) {
    if (listA[i] !== listB[i]) {
      return false;
    }
  }

  return true;
}

export function areValueListsEqual(listA, listB) {
  if (listA === null && listB === null) {
    return true;
  }

  if (typeof(listA) !== typeof(listB)) {
    return false
  }

  if (listA.length !== listB.length) {
    return false
  }

  for (let i = 0; i < listA.length; i++) {
    if (listA[i].id !== listB[i].id) {
      return false;
    }
  }

  return true;
}

// A nice helper to tell us if we're on the server
export const isServer = !(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export const convertIdToUrl = (id, resource) => {
  return `${apiSettings.apiResourceEndpoints[resource]}${id}/`
};
