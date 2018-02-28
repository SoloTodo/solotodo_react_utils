import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import RcContinuousRange from "./RcContinuousRange";
import {withRouter} from "react-router-dom";


class ApiFormContinuousRangeField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.parseValueFromUrl(props)
    }
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (!props.onChange) {
      return
    }

    if (!this.state.value || this.state.value.startValue !== newValue.startValue || this.state.value.endValue !== newValue.endValue) {
      this.setState({
        value: newValue
      }, () => this.notifyNewParams(newValue, props, pushUrl))
    }
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen(() => this.componentUpdate());
    this.componentUpdate();
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.onChange && nextProps.onChange) {
      this.notifyNewParams(this.state.value, nextProps)
    }
  }

  componentUpdate = props => {
    props = props || this.props;

    const newValue = this.parseValueFromUrl(props);
    this.setValue(newValue, props);
  };

  parseValueFromUrl = props => {
    props = props || this.props;
    const parameters = queryString.parse(window.location.search);

    const startValue = parseInt(parameters[changeCase.snakeCase(props.name) + '_start'], 10) || null;
    const endValue = parseInt(parameters[changeCase.snakeCase(props.name) + '_end'], 10) || null;

    return {
      startValue,
      endValue
    }
  };

  notifyNewParams(values, props, pushUrl=false) {
    props = props || this.props;

    if (!props.onChange) {
      return;
    }

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

    const result = {
      [this.props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startValue: values.startValue,
          endValue: values.endValue
        }
      }
    };

    props.onChange(result, pushUrl)
  }

  render() {
    const originalChoices = this.props.choices;

    if (!originalChoices || !originalChoices.length) {
      return (
          <div>
            <label>{this.props.label}</label>
            <Range />
          </div>)
    }

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

    const min = newChoices[0].value;
    const max = newChoices[newChoices.length - 1].value;

    let startValue = this.state.value ? this.state.value.startValue : null;
    let endValue = this.state.value ? this.state.value.endValue : null;

    if (startValue && startValue < min) {
      startValue = null
    }

    if (endValue && endValue > max) {
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
        }, this.props, true)
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

export default withRouter(ApiFormContinuousRangeField)