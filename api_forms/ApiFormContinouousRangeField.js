import React from 'react'
import Big from 'big.js';
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import RcContinuousRange from "./RcContinuousRange";
import {addContextToField, areBigNumbersEqual} from "./utils";


export class ApiFormContinuousRangeField extends React.Component {
  constructor(props) {
    super(props);

    let initialValue = null;

    if (props.initialValue) {
      initialValue = {
        startValue: props.initialValue.startValue ? new Big(props.initialValue.startValue) : null,
        endValue: props.initialValue.endValue ? new Big(props.initialValue.endValue) : null
      };
    } else {
      initialValue = ApiFormContinuousRangeField.parseValueFromUrl(props)
    }

    this.state = {
      value: initialValue
    };

    if (!props.initialValue) {
      ApiFormContinuousRangeField.notifyNewParams(initialValue, props, false);
    }
  }

  routeChangeHandler = () => {
    const newValue = ApiFormContinuousRangeField.parseValueFromUrl(this.props);
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

  setValue(newValue, pushUrl=false) {
    if (!this.state.value || !areBigNumbersEqual(this.state.value.startValue, newValue.startValue) || !areBigNumbersEqual(this.state.value.endValue, newValue.endValue)) {
      this.setState({
        value: newValue
      }, () => ApiFormContinuousRangeField.notifyNewParams(newValue, this.props, pushUrl))
    }
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    const startValueString = parameters[changeCase.snakeCase(props.name) + '_start'];
    const endValueString = parameters[changeCase.snakeCase(props.name) + '_end'];

    const startValue = startValueString ? new Big(startValueString) : null;
    const endValue = endValueString ? new Big(endValueString) : null;

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
      apiParams[baseFieldName + '_0'] = [values.startValue.toString()];
      urlParams[baseFieldName + '_start'] = [values.startValue.toString()]
    }

    if (values.endValue !== null) {
      apiParams[baseFieldName + '_1'] = [values.endValue.toString()];
      urlParams[baseFieldName + '_end'] = [values.endValue.toString()]
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
    if (!this.props.choices || !this.props.choices.length) {
      return (
          <div>
            <label>{this.props.label}</label>
            <Range />
          </div>)
    }

    const originalChoices = this.props.choices.map(choice => ({
      ...choice,
      value: parseFloat(choice.id)
    }));

    originalChoices.sort((a, b) => a.id - b.id);

    const step = new Big(this.props.step);
    const bucketDocCountDict = {};

    for (const choice of originalChoices) {
      const bucket = new Big(choice.value).div(step).round(0, 0).times(step);

      if (!bucketDocCountDict[bucket]) {
        bucketDocCountDict[bucket] = {
          exactDocCount: choice.value === bucket ? choice.doc_count : 0,
          bucketDocCount: 0
        }
      }

      bucketDocCountDict[bucket].bucketDocCount += choice.doc_count;
    }

    const originalMin = new Big(originalChoices[0].value);
    const originalMax = new Big(originalChoices[originalChoices.length - 1].value);
    const steppedMin = originalMin.div(step).round(0, 0).times(step);
    const newChoices = [];

    for (let steppedValue = steppedMin; steppedValue.lt(originalMax.plus(step)); steppedValue = steppedValue.plus(step)) {
      const bucketDocData = bucketDocCountDict[steppedValue] || {};

      newChoices.push({
        value: steppedValue,
        bucketDocCount: bucketDocData.bucketDocCount || 0,
        exactDocCount: bucketDocData.exactDocCount || 0,
      })
    }

    let valueDocCountDict = {};
    let ongoingDocCount = 0;

    for (const choice of newChoices) {
      valueDocCountDict[choice.value] = {
        ownDocCount: choice.exactDocCount,
        aggregatedDocCount: ongoingDocCount
      };

      ongoingDocCount += choice.bucketDocCount;
    }

    const min = newChoices.length ? newChoices[0].value : null;
    const max = newChoices.length ? newChoices[newChoices.length - 1].value : null;

    let startValue = this.state.value ? this.state.value.startValue : null;
    let endValue = this.state.value ? this.state.value.endValue : null;

    if (startValue && (startValue.lt(min) || startValue.gt(max))) {
      startValue = null
    }

    if (endValue && (endValue.lt(min) || endValue.gt(max))) {
      endValue = null
    }

    const handleValueChange = newValues => {
      let newStartValue = null;
      let newEndValue = null;

      const newValues0 = new Big(newValues[0]);
      const newValues1 = new Big(newValues[1]);

      for (const choice of newChoices) {
        const choiceValue = new Big(choice.value);

        if (choiceValue.eq(newValues0)) {
          newStartValue = choice.value
        }

        if (choice.value.eq(newValues1)) {
          newEndValue = choice.value
        }
      }

      if (newValues0.lte(min)) {
        newStartValue = null
      }

      if (newValues1.gte(max)) {
        newEndValue = null
      }

      if (!this.state.value || !areBigNumbersEqual(this.state.value.startValue, newStartValue) || !areBigNumbersEqual(this.state.value.endValue, newEndValue)) {
        this.setValue({
          startValue: newStartValue,
          endValue: newEndValue
        }, true)
      }
    };

    const handle = (props) => {
      const { value, dragging, index, ...restProps } = props;

      let concreteStartValue = startValue || min;
      let concreteEndValue = endValue || max;

      let startDocCounts = {};
      let endDocCounts = {};
      let valueRangeAsText = '';

      if (index === 0) {
        startDocCounts = valueDocCountDict[value];
        endDocCounts = valueDocCountDict[concreteEndValue];
        valueRangeAsText = `${value} - ${concreteEndValue}`
      } else {
        startDocCounts = valueDocCountDict[concreteStartValue];
        endDocCounts = valueDocCountDict[value];
        valueRangeAsText = `${concreteStartValue} - ${value}`
      }

      const resultCount = endDocCounts.ownDocCount + endDocCounts.aggregatedDocCount - startDocCounts.aggregatedDocCount;

      return (
          <Tooltip
              prefixCls="rc-slider-tooltip"
              overlay={<span>{valueRangeAsText} {this.props.unit} ({resultCount} {this.props.resultCountSuffix})</span>}
              visible={dragging}
              placement="top"
              key={index}
          >
            <Handle value={value} {...restProps} />
          </Tooltip>
      );
    };

    return (
        <div className="row">
          <div className="col-12 pb-3">
            <label>{this.props.label}</label>
            <div className="pb-2">
              <RcContinuousRange
                  value={[startValue || min, endValue || max]}
                  min={min}
                  max={max}
                  step={this.props.step}
                  onAfterChange={handleValueChange}
                  handle={handle}
              />
            </div>
          </div>
        </div>)
  }
}

export default addContextToField(ApiFormContinuousRangeField)