import {withRouter} from 'next/router';
import ApiFormPriceRangeField from './ApiFormPriceRangeField'
import ApiFormTextField from './ApiFormTextField'
import ApiFormChoiceField from './ApiFormChoiceField'
import ApiFormPaginationField from './ApiFormPaginationField'

const convertFieldToNext = ApiFormField => {
  const ApiFormFieldNext = withRouter(ApiFormField);
  ApiFormField.getInitialProps = props => {
    const initialValue = ApiFormField.parseValueFromUrl(props);
    return ApiFormField.getNotificationValue(initialValue, props);
  };

  return withRouter(ApiFormFieldNext);
};

export const ApiFormPriceRangeFieldNext = convertFieldToNext(ApiFormPriceRangeField);
export const ApiFormTextFieldNext = convertFieldToNext(ApiFormTextField);
export const ApiFormChoiceFieldNext = convertFieldToNext(ApiFormChoiceField);
export const ApiFormPaginationFieldNext = convertFieldToNext(ApiFormPaginationField);
