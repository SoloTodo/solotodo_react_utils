import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import Tooltip from 'rc-tooltip';
import {Handle} from 'rc-slider';
import RcPriceRange from "./RcPriceRange";
import {ApiResourceObject} from "../ApiResource";
import {formatCurrency} from "../utils";
import {addContextToField} from "./utils";


export class ApiFormPriceRangeField extends Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormPriceRangeField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (!props.initialValue) {
      ApiFormPriceRangeField.notifyNewParams(initialValue, props, false);
    }
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    const oldValue = this.state.value;

    if (!oldValue || oldValue.startValue !== newValue.startValue || oldValue.endValue !== newValue.endValue) {
      this.setState({
        value: newValue
      }, () => ApiFormPriceRangeField.notifyNewParams(newValue, props, pushUrl))
    }
  }

  routeChangeHandler = () => {
    const newValue = ApiFormPriceRangeField.parseValueFromUrl(this.props);
    this.setValue(newValue, this.props);
  };

  componentDidMount() {
    if (this.props.router) {
      this.props.router.events.on('routeChangeComplete', this.routeChangeHandler)
    } else {
      this.unlisten = this.props.history.listen(this.routeChangeHandler);
    }
  }

  componentWillUnmount() {
    if (this.props.router) {
      this.props.router.events.off('routeChangeComplete', this.routeChangeHandler)
    } else {
      this.unlisten();
    }
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    const startValue = parseFloat(parameters[changeCase.snakeCase(props.name) + '_start']) || null;
    const endValue = parseFloat(parameters[changeCase.snakeCase(props.name) + '_end']) || null;

    return {
      startValue,
      endValue
    }
  };

  static getNotificationValue(values, props) {
    const apiParams = {};
    const urlParams = {};
    const baseFieldName = changeCase.snake(props.name);

    if (values.startValue !== null) {
      apiParams[baseFieldName + '_0'] = [values.startValue];
      urlParams[baseFieldName + '_start'] = [values.startValue]
    }

    if (values.endValue !== null) {
      apiParams[baseFieldName + '_1'] = [values.endValue];
      urlParams[baseFieldName + '_end'] = [values.endValue]
    }

    return {
      [props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startValue: values.startValue,
          endValue: values.endValue
        }
      }
    };
  }

  static notifyNewParams(values, props, pushUrl=false) {
    const result = this.getNotificationValue(values, props);
    props.onChange(result, pushUrl)
  }

  render() {
    const min = this.props.min;
    const max = this.props.max;

    let startValue = this.state.value ? this.state.value.startValue : min;
    let endValue = this.state.value ? this.state.value.endValue : max;

    if (startValue <= min) {
      startValue = null
    }

    if (endValue >= max) {
      endValue = null
    }

    const handleValueChange = newValues => {
      let newStartValue = newValues[0] || null;
      let newEndValue = newValues[1] || null;

      if (newStartValue <= min) {
        newStartValue = null
      }

      if (newEndValue >= max) {
        newEndValue = null
      }

      if (!this.state.value || this.state.value.startValue !== newStartValue || this.state.value.endValue !== newEndValue) {
        this.setValue({
          startValue: newStartValue,
          endValue: newEndValue
        }, this.props, true)
      }
    };

    const currency = new ApiResourceObject(this.props.currency, {});
    const conversionCurrency = this.props.conversionCurrency && new ApiResourceObject(this.props.conversionCurrency, {});

    const handle = (props, startValue, endValue) => {
      const { value, dragging, index, ...restProps } = props;

      const numberFormat = this.props.numberFormat;

      const valueForConversion = index === 0 ? startValue : endValue;

      const formattedValue = formatCurrency(valueForConversion, currency, conversionCurrency, numberFormat.thousands_separator, numberFormat.decimal_separator);

      return (
        <Tooltip
          prefixCls="rc-slider-tooltip"
          overlay={<span>{formattedValue}</span>}
          visible={dragging}
          placement="top"
          key={index}
        >
          <Handle value={value || 0} {...restProps} />
        </Tooltip>
      );
    };

    return (
      <div className="row">
        <div className="col-12 pb-3">
          <label>{this.props.label}</label>
          <div className="pb-2">
            <RcPriceRange
              value={[startValue, endValue]}
              min={min}
              max={max}
              p80th={this.props.p80th}
              onAfterChange={handleValueChange}
              handle={handle}
            />
          </div>
        </div>
      </div>)
  }
}

export default addContextToField(ApiFormPriceRangeField)