import React from 'react';
import {withRouter} from 'next/router';
// Use the named imports for the fields to inject the nextJS router inside the ContextConsumer!
import { ApiFormPriceRangeField } from './ApiFormPriceRangeField'
import { ApiFormTextField } from './ApiFormTextField'
import { ApiFormChoiceField } from './ApiFormChoiceField'
import { ApiFormPaginationField } from './ApiFormPaginationField'
import { ApiFormDiscreteRangeField } from './ApiFormDiscreteRangeField'
import { ApiFormContinuousRangeField } from './ApiFormContinouousRangeField'
import {ApiFormContext} from "./ApiForm";

const convertFieldToNext = ApiFormField => {
  let ApiFormFieldNext = withRouter(ApiFormField);
  ApiFormFieldNext.parseValueFromUrl = ApiFormField.parseValueFromUrl;
  ApiFormFieldNext.getNotificationValue = ApiFormField.getNotificationValue;

  const ApiFormFieldNextWithContext = React.forwardRef((props, ref) => (
    <ApiFormContext.Consumer>
      {({handleFieldChange, history}) => <ApiFormFieldNext {...props} onChange={handleFieldChange} history={history} ref={ref} />}
    </ApiFormContext.Consumer>
  ));

  ApiFormFieldNextWithContext.getInitialProps = (props, asPath) => {
    const composedProps = {...props, router: {asPath: asPath}};
    const initialValue = ApiFormFieldNext.parseValueFromUrl(composedProps);
    return ApiFormFieldNext.getNotificationValue(initialValue, composedProps);
  };

  return ApiFormFieldNextWithContext

};

export const ApiFormPriceRangeFieldNext = convertFieldToNext(ApiFormPriceRangeField);
export const ApiFormTextFieldNext = convertFieldToNext(ApiFormTextField);
export const ApiFormChoiceFieldNext = convertFieldToNext(ApiFormChoiceField);
export const ApiFormPaginationFieldNext = convertFieldToNext(ApiFormPaginationField);
export const ApiFormDiscreteRangeFieldNext = convertFieldToNext(ApiFormDiscreteRangeField);
export const ApiFormContinuousRangeFieldNext = convertFieldToNext(ApiFormContinuousRangeField);
