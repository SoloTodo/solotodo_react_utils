import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import moment from "moment";
import './ApiFormDateRangeField.css'
import {parseDateToCurrentTz} from "../utils";
import {areDatesEqual} from "./utils";

class ApiFormDateRangeField extends Component {
  componentWillMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps)
  }

  componentUpdate = props => {
    const newValue = this.parseValueFromUrl(props);

    if (!props.value || !areDatesEqual(props.value.startDate, newValue.startDate) || !areDatesEqual(props.value.endDate, newValue.endDate)) {
      this.notifyNewParams(newValue, props, false);
    }
  };

  parseValueFromUrl = props => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Obtain URL params
    const parameters = queryString.parse(window.location.search);
    const startDateStr = parameters[changeCase.snakeCase(props.name) + '_start'];
    let startDate = null;
    if (dateRegex.test(startDateStr)) {
      startDate = parseDateToCurrentTz(startDateStr);
    }

    const endDateStr = parameters[changeCase.snakeCase(props.name) + '_end'];
    let endDate = null;
    if (dateRegex.test(endDateStr)) {
      endDate = parseDateToCurrentTz(endDateStr);
    }

    let defaultStartDate = props.min;
    if (!defaultStartDate) {
      defaultStartDate = moment(endDate).subtract(30, 'days');
    }

    const max = props.max ? props.max : moment().startOf('day');

    if (!props.nullable) {
      // If they are empty, replace with initial values, if given
      if (props.initial) {
        if (!startDate) {
          startDate = props.initial[0]
        }
        if (!endDate) {
          endDate = props.initial[1]
        }
      }

      // If dates still not available, use default values
      if (!endDate) {
        endDate = max;
      }

      if (!startDate) {
        startDate = defaultStartDate
      }
    }

    const min = props.min;

    if (
        (min && startDate && min.isAfter(startDate)) ||
        (startDate && endDate && startDate.isAfter(endDate)) ||
        (endDate && endDate.isAfter(max))) {

      startDate = props.nullable ? null : min ? min : defaultStartDate;
      endDate = props.nullable ? null : max
    }

    return {
      startDate: startDate,
      endDate: endDate
    }
  };

  notifyNewParams(value, props=null, allowUpdateResults=true) {
    props = props || this.props;

    if (!props.onChange) {
      return;
    }

    const apiParams = {};
    const urlParams = {};
    const baseFieldName = changeCase.snake(props.name);

    if (value.startDate) {
      apiParams[baseFieldName + '_0'] = [value.startDate.toISOString()];
      urlParams[baseFieldName + '_start'] = [value.startDate.format('YYYY-MM-DD')]
    }

    if (value.endDate) {
      apiParams[baseFieldName + '_1'] = [moment(value.endDate).add(1, 'days').toISOString()];
      urlParams[baseFieldName + '_end'] = [value.endDate.format('YYYY-MM-DD')]
    }

    const result = {
      [props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startDate: value.startDate,
          endDate: value.endDate
        }
      }
    };

    props.onChange(result, allowUpdateResults)
  }

  handleDateChange = (event) => {
    const startDateValue = document.getElementById(this.props.name + '_start').value;
    const endDateValue = document.getElementById(this.props.name + '_end').value;

    const startDate = startDateValue ? parseDateToCurrentTz(startDateValue) : null;
    const endDate = endDateValue ? parseDateToCurrentTz(endDateValue) : null;

    this.notifyNewParams({
      startDate,
      endDate
    })
  };

  render() {
    const max = this.props.max ? this.props.max : moment().startOf('day');

    let startDate = null;
    let endDate = null;

    if (this.props.value) {
      startDate = this.props.value.startDate;
      endDate = this.props.value.endDate
    }

    return (
        <div className="row">
          <div className="col-12 col-sm-6">
            <input
                type="date"
                id={this.props.name + '_start'}
                className="form-control"
                required={!this.props.nullable}
                min={this.props.min ? this.props.min.format('YYYY-MM-DD') : ''}
                max={endDate ? endDate.format('YYYY-MM-DD') : max.format('YYYY-MM-DD')}
                value={startDate ? startDate.format('YYYY-MM-DD') : ''}
                onChange={evt => this.handleDateChange(evt)}
            />
          </div>
          <div className="col-12 col-sm-6 end-date-container">
            <input
                type="date"
                id={this.props.name + '_end'}
                className="form-control"
                required={!this.props.nullable}
                min={startDate ? startDate.format('YYYY-MM-DD') :
                    this.props.min ? this.props.min.format('YYYY-MM-DD') : ''}
                max={max.format('YYYY-MM-DD')}
                value={endDate ? endDate.format('YYYY-MM-DD') : ''}
                onChange={evt => this.handleDateChange(evt)}
            />
          </div>
        </div>)
  }
}

export default ApiFormDateRangeField