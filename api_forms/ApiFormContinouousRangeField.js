import React from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import RcContinuousRange from "./RcContinuousRange";
import {addContextToField} from "./utils";


class ApiFormContinuousRangeField extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormContinuousRangeField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (!props.initialValue) {
      ApiFormContinuousRangeField.notifyNewParams(initialValue, props, false);
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      const newValue = ApiFormContinuousRangeField.parseValueFromUrl(this.props);
      this.setValue(newValue);
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  setValue(newValue, pushUrl=false) {
    if (!this.state.value || this.state.value.startValue !== newValue.startValue || this.state.value.endValue !== newValue.endValue) {
      this.setState({
        value: newValue
      }, () => ApiFormContinuousRangeField.notifyNewParams(newValue, this.props, pushUrl))
    }
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    const startValue = parseInt(parameters[changeCase.snakeCase(props.name) + '_start'], 10) || null;
    const endValue = parseInt(parameters[changeCase.snakeCase(props.name) + '_end'], 10) || null;

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

    const step = this.props.step;
    const bucketDocCountDict = {};

    for (const choice of originalChoices) {
      const bucket = Math.floor(choice.value / step) * step;

      if (!bucketDocCountDict[bucket]) {
        bucketDocCountDict[bucket] = {
          exactDocCount: choice.value === bucket ? choice.doc_count : 0,
          bucketDocCount: 0
        }
      }

      bucketDocCountDict[bucket].bucketDocCount += choice.doc_count;
    }

    const originalMin = originalChoices[0].value;
    const originalMax = originalChoices[originalChoices.length - 1].value;
    const steppedMin = Math.floor((originalMin / step)) * step;
    const newChoices = [];


    for (let steppedValue = steppedMin; steppedValue < originalMax + step; steppedValue += step) {
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

    if (startValue && (startValue < min || startValue > max)) {
      startValue = null
    }

    if (endValue && (endValue < min || endValue > max)) {
      endValue = null
    }

    const handleValueChange = newValues => {
      let newStartValue = null;
      let newEndValue = null;

      for (const choice of newChoices) {
        if (choice.value === newValues[0]) {
          newStartValue = choice.value
        }

        if (choice.value === newValues[1]) {
          newEndValue = choice.value
        }
      }

      if (newValues[0] <= min) {
        newStartValue = null
      }

      if (newValues[1] >= max) {
        newEndValue = null
      }

      if (!this.state.value || this.state.value.startValue !== newStartValue || this.state.value.endValue !== newEndValue) {
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