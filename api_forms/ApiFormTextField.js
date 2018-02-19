import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {DebounceInput} from 'react-debounce-input';

class ApiFormTextField extends Component {
  componentWillMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps)
  }

  componentUpdate = props => {
    const newValue = this.parseValueFromUrl(props);

    if (props.value !== newValue) {
      this.notifyNewParams(newValue, props);
    }
  };

  parseValueFromUrl = props => {
    props = props || this.props;

    const parameters = queryString.parse(window.location.search);

    let value = parameters[changeCase.snake(props.name)];

    if (Array.isArray(value)) {
      value = value[0]
    }

    return value ? value : props.initial || '';
  };

  notifyNewParams(value, props) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (value && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = [value]
    }

    const apiParams = value ? {[fieldName]: [value]} : {};

    const result = {
      [this.props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: value
      }
    };

    props.onChange(result)
  }

  handleValueChange = evt => {
    evt.preventDefault();
    this.notifyNewParams(evt.target.value)
  };

  render() {
    if (this.props.hidden) {
      return null
    }

    const value = this.props.value || '';
    const debounceTimeout = this.props.debounceTimeout || 2000;

    return (
        <DebounceInput
            type="text"
            name={this.props.name}
            id={this.props.name}
            className="form-control"
            debounceTimeout={debounceTimeout}
            onChange={this.handleValueChange}
            value={value}
        />
    )
  }
}

export default ApiFormTextField