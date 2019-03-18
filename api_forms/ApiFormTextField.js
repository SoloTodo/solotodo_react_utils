import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {DebounceInput} from 'react-debounce-input';
import createHistory from 'history/createBrowserHistory'
import {addContextToField} from "./utils";

class ApiFormTextField extends Component {
  constructor(props) {
    super(props);

    const initialValue = this.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    this.notifyNewParams(initialValue, props, false);
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (this.state.value !== newValue) {
      this.setState({
        value: newValue
      }, () => this.notifyNewParams(newValue, props, pushUrl))
    }
  }

  componentDidMount() {
    const history = createHistory();
    this.unlisten = history.listen(() => this.componentUpdate());
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentUpdate = props => {
    props = props || this.props;

    const newValue = this.parseValueFromUrl(props);
    this.setValue(newValue, props);
  };

  parseValueFromUrl = props => {
    props = props || this.props;

    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    let value = parameters[changeCase.snake(props.name)];

    if (Array.isArray(value)) {
      value = value[0]
    }

    return value ? value : props.initial || '';
  };

  notifyNewParams(value, props, pushUrl=false) {
    props = props ? props : this.props;

    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (value && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = [value]
    }

    const apiParams = value ? {[fieldName]: [value]} : {};

    const result = {
      [props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: value
      }
    };

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