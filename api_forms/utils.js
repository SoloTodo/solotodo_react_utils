import React from 'react';
import {ApiFormContext} from "./ApiForm";

export function createOrderingOptionChoices(fields) {
  const result = [];

  for (const field of fields) {
    result.push(createOrderingOptionChoice(field));
    result.push(createOrderingOptionChoice('-' + field));
  }

  return result
}

export function createOrderingOptionChoice(field) {
  return {
    id: field,
    name: field
  }
}

export function createPageSizeChoices(pageSizes) {
  return pageSizes.map(pageSize => ({
    id: pageSize.toString(),
    name: pageSize.toString()
  }))
}

export function areDatesEqual(dateA, dateB) {
  if (dateA === null && dateB === null) {
    return true;
  }

  if (dateA === null || dateB === null) {
    return false;
  }

  if (typeof(dateA) !== typeof(dateB)) {
    return false;
  }

  return dateA.isSame(dateB)
}

export const addContextToField = Component => {
  return React.forwardRef((props, ref) => (
    <ApiFormContext.Consumer>
      {({handleFieldChange, history}) => <Component {...props} onChange={handleFieldChange} history={history} ref={ref} />}
    </ApiFormContext.Consumer>
  ));
};