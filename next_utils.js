import Big from 'big.js';
import {_formatCurrency} from './utils';

export function formatCurrency(value, valueCurrency, conversionCurrency, thousandsSeparator, decimalSeparator) {
  if (typeof value === 'undefined' || value === null || Number.isNaN(value)) {
    return ''
  }

  let formattingCurrency = valueCurrency;

  if (conversionCurrency && (valueCurrency.url !== conversionCurrency.url)) {
    value *= new Big(conversionCurrency.exchange_rate) / new Big(valueCurrency.exchange_rate);
    formattingCurrency = conversionCurrency
  }

  const decimalPlaces = formattingCurrency.decimal_places;
  const prefix = formattingCurrency.prefix;
  const decimalValue = new Big(value);

  return prefix + ' ' + _formatCurrency(decimalValue, decimalPlaces, 3, thousandsSeparator, decimalSeparator);
}
