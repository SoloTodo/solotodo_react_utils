import React from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import moment from "moment";
import './ApiFormDateRangeField.css'
import {areDatesEqual} from "./utils";
import {addContextToField} from "./utils";

class ApiFormDateRangeField extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormDateRangeField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (!props.initialValue) {
      ApiFormDateRangeField.notifyNewParams(initialValue, props, false);
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      const newValue = ApiFormDateRangeField.parseValueFromUrl(this.props);
      this.setValue(newValue, this.props);
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (!this.state.value || !areDatesEqual(this.state.value.startDate, newValue.startDate) || !areDatesEqual(this.state.value.endDate, newValue.endDate)) {
      this.setState({
        value: newValue
      }, () => ApiFormDateRangeField.notifyNewParams(newValue, props, pushUrl))
    }
  }

  static parseValueFromUrl = props => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Obtain URL params
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);
    const startDateStr = parameters[changeCase.snakeCase(props.name) + '_start'];
    let startDate = null;
    if (dateRegex.test(startDateStr)) {
      startDate = moment.utc(startDateStr);
    }

    const endDateStr = parameters[changeCase.snakeCase(props.name) + '_end'];
    let endDate = null;
    if (dateRegex.test(endDateStr)) {
      endDate = moment.utc(endDateStr);
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

  static getNotificationValue(value, props) {
    const apiParams = {};
    const urlParams = {};
    const baseFieldName = changeCase.snake(props.name);

    if (value.startDate) {
      apiParams[baseFieldName + '_0'] = [value.startDate.toISOString()];
      urlParams[baseFieldName + '_start'] = [value.startDate.format('YYYY-MM-DD')]
    }

    if (value.endDate) {
      apiParams[baseFieldName + '_1'] = [moment(value.endDate).endOf("day").toISOString()];
      urlParams[baseFieldName + '_end'] = [value.endDate.format('YYYY-MM-DD')]
    }

    return {
      [props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startDate: value.startDate,
          endDate: value.endDate
        }
      }
    };
  }

  static notifyNewParams(value, props, pushUrl=false) {
    const result = this.getNotificationValue(value, props)
    props.onChange(result, pushUrl)
  }

  handleDateChange = () => {
    const startDateValue = document.getElementById(this.props.name + '_start').value;
    const endDateValue = document.getElementById(this.props.name + '_end').value;

    const startDate = startDateValue ? moment.utc(startDateValue) : null;
    const endDate = endDateValue ? moment.utc(endDateValue) : null;

    console.log(startDate.format());
    console.log(endDate.format());

    this.setValue({
      startDate,
      endDate
    }, this.props, true)
  };

  render() {
    const max = this.props.max ? this.props.max : moment().startOf('day');

    let startDate = null;
    let endDate = null;

    if (this.state.value) {
      startDate = this.state.value.startDate;
      endDate = this.state.value.endDate
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

export default addContextToField(ApiFormDateRangeField)