import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import RcDiscreteRange from "./RcDiscreteRange";
import {withRouter} from "react-router-dom";


class ApiFormDiscreteRangeField extends Component {
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

    if (!this.state.value || this.state.value.startId !== newValue.startId || this.state.value.endId !== newValue.endId) {
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

  notifyNewParams(ids, props=null, pushUrl=false) {
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

    props.onChange(result, pushUrl)
  }

  render() {
    const choices = this.props.choices.map(choice => ({
      ...choice,
      value: parseFloat(choice.value)
    }));

    if (!choices || !choices.length) {
      return (
          <div>
            <label>{this.props.label}</label>
            <Range />
          </div>)
    }

    const min = choices[0].value;
    const max = choices[choices.length - 1].value;

    const startId = this.state.value ? this.state.value.startId : null;
    const endId = this.state.value ? this.state.value.endId : null;

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
        ownDocCount: choice.doc_count || 0,
        aggregatedDocCount: ongoingDocCount
      };

      ongoingDocCount += choice.doc_count || 0;
    }

    const handleValueChange = newValues => {
      const newStartChoice = choices.filter(choice => choice.value === newValues[0])[0];
      const newEndChoice = choices.filter(choice => choice.value === newValues[1])[0];

      const newStartId = newStartChoice.value === min ? null : newStartChoice.id;
      const newEndId = newEndChoice.value === max ? null : newEndChoice.id;

      if (!this.state.value || this.state.value.startId !== newStartId || this.state.value.endId !== newEndId) {
        this.setValue({
          startId: newStartId,
          endId: newEndId
        }, this.props, true)
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

export default withRouter(ApiFormDiscreteRangeField)