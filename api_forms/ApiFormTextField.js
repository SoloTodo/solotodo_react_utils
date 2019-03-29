import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {DebounceInput} from 'react-debounce-input';
import {addContextToField} from "./utils";

export class ApiFormTextField extends Component {
  constructor(props) {
    super(props);

    const usePropsInitialValue = typeof props.initialValue === 'string';
    const initialValue = usePropsInitialValue ? props.initialValue : ApiFormTextField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (!usePropsInitialValue) {
      ApiFormTextField.notifyNewParams(initialValue, props, false);
    }
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (this.state.value !== newValue) {
      this.setState({
        value: newValue
      }, () => ApiFormTextField.notifyNewParams(newValue, props, pushUrl))
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      const newValue = ApiFormTextField.parseValueFromUrl(this.props);
      this.setValue(newValue, this.props);
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    let value = parameters[changeCase.snake(props.name)];

    if (Array.isArray(value)) {
      value = value[0]
    }

    return value ? value : props.initial || '';
  };

  static getNotificationValue(value, props) {
    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (value && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = [value]
    }

    const apiParams = value ? {[fieldName]: [value]} : {};

    return {
      [props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: value
      }
    };
  }

  static notifyNewParams(value, props, pushUrl=false) {
    const result = this.getNotificationValue(value, props);
    props.onChange(result, pushUrl)
  }

  handleValueChange = evt => {
    evt.preventDefault();
    this.setValue(evt.target.value, this.props, true)
  };

  render() {
    if (this.props.hidden) {
      return null
    }

    const value = this.state.value || '';
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

export default addContextToField(ApiFormTextField)