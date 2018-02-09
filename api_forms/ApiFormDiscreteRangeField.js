import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import RcDiscreteRange from "./RcDiscreteRange";
import {areListsEqual, areValueListsEqual} from "../utils";


class ApiFormDiscreteRangeField extends Component {
  componentDidMount() {
    this.notifyNewParams(this.parseIdFromUrl())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseIdFromUrl(), nextProps);
      return;
    }

    if (typeof(nextProps.value) === 'undefined') {
      this.notifyNewParams(this.parseIdFromUrl(nextProps), nextProps, false);
      return;
    }

    if (!areValueListsEqual(this.props.choices, nextProps.choices)) {
      const newValues = this.parseIdFromUrl(nextProps);
      if (!areListsEqual(this.props.value, newValues)) {
        this.notifyNewParams(newValues, nextProps, false);
      }
    }
  }

  parseIdFromUrl = props => {
    props = props || this.props;

    // Obtain URL params
    const parameters = queryString.parse(window.location.search);

    let startId = parseInt(parameters[changeCase.snakeCase(props.name) + '_start'], 10);
    const startChoice = props.choices.filter(choice => choice.id === startId)[0] || null;
    if (!startChoice) {
      startId = null
    }

    let endId = parseInt(parameters[changeCase.snakeCase(props.name) + '_end'], 10);
    const endChoice = props.choices.filter(choice => choice.id === endId)[0];
    if (!endChoice) {
      endId = null
    }

    return {
      startId,
      endId
    }
  };

  notifyNewParams(ids, props=null, allowUpdateResults=true) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const apiParams = {};
    const urlParams = {};
    const baseFieldName = changeCase.snake(props.name);

    if (ids.startId) {
      apiParams[baseFieldName + '_0'] = [ids.startId];
      urlParams[baseFieldName + '_start'] = [ids.startId]
    }

    if (ids.endId) {
      apiParams[baseFieldName + '_1'] = [ids.endId];
      urlParams[baseFieldName + '_end'] = [ids.endId]
    }

    const result = {
      [this.props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startId: ids.startId,
          endId: ids.endId
        }
      }
    };

    props.onChange(result, allowUpdateResults && Boolean(this.props.updateResultsOnChange))
  }

  render() {
    const choices = this.props.choices;

    if (!choices || !choices.length) {
      return (
          <div>
            <label>{this.props.label}</label>
            <Range />
          </div>)
    }

    const min = choices[0].value;
    const max = choices[choices.length - 1].value;

    const startId = this.props.value ? this.props.value.startId : null;
    const endId = this.props.value ? this.props.value.endId : null;

    let marks = {};
    let valueDocCountDict = {};
    let ongoingDocCount = 0;

    const startChoice = choices.filter(choice => choice.id === startId)[0];
    const endChoice = choices.filter(choice => choice.id === endId)[0];

    const startValue = startChoice ? startChoice.value : min;
    const endValue = endChoice ? endChoice.value : max;

    for (const choice of choices) {
      marks[choice.value] = choice.label;

      valueDocCountDict[choice.value] = {
        ownDocCount: choice.doc_count,
        aggregatedDocCount: ongoingDocCount
      };

      ongoingDocCount += choice.doc_count;
    }

    const handleValueChange = newValues => {
      const newStartChoice = choices.filter(choice => choice.value === newValues[0])[0];
      const newEndChoice = choices.filter(choice => choice.value === newValues[1])[0];

      const newStartId = newStartChoice.value === min ? null : newStartChoice.id;
      const newEndId = newEndChoice.value === max ? null : newEndChoice.id;

      if (this.props.value.startId !== newStartId || this.props.value.endId !== newEndId) {
        this.notifyNewParams({
          startId: newStartId,
          endId: newEndId
        })
      }

    };

    const handle = (props) => {
      const { value, dragging, index, ...restProps } = props;

      let startDocCounts = {};
      let endDocCounts = {};
      if (index === 0) {
        startDocCounts = valueDocCountDict[value];
        endDocCounts = valueDocCountDict[endValue];
      } else {
        startDocCounts = valueDocCountDict[startValue];
        endDocCounts = valueDocCountDict[value];
      }

      const resultCount = endDocCounts.ownDocCount + endDocCounts.aggregatedDocCount - startDocCounts.aggregatedDocCount;

      return (
          <Tooltip
              prefixCls="rc-slider-tooltip"
              overlay={<span>{resultCount} {this.props.resultCountSuffix}</span>}
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
              <RcDiscreteRange
                  marks={marks}
                  min={min}
                  max={max}
                  value={[startValue, endValue]}
                  onAfterChange={handleValueChange}
                  handle={handle}
              />
            </div>
          </div>
        </div>)
  }
}

export default ApiFormDiscreteRangeField