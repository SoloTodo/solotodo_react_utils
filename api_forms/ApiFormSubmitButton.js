import React from 'react';
import LaddaButton from "react-ladda";
import queryString from "query-string";
import {addContextToField} from "./utils";


export class ApiFormSubmitButton extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormSubmitButton.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (typeof(props.initialValue) === 'undefined') {
      ApiFormSubmitButton.notifyNewParams(initialValue, props, false);
    }
  }

  setValue(newValue, pushUrl=false) {
    if (newValue !== this.state.value) {
      this.setState({
        value: newValue
      }, () => {
        ApiFormSubmitButton.notifyNewParams(newValue, this.props, pushUrl)
      })
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      const newValue = ApiFormSubmitButton.parseValueFromUrl(this.props);
      this.setValue(newValue);
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    return Boolean(parameters.submit);
  };

  static getNotificationValue(value) {
    return {
      submit: {
        apiParams: {submit: []},
        urlParams: value ? {submit: [1]} : {submit: []},
        fieldValues: value
      }
    };
  }

  static notifyNewParams(value, props, pushUrl) {
    const result = this.getNotificationValue(value);
    props.onChange(result, pushUrl)
  }

  handleValueChange = evt => {
    evt.preventDefault();
    this.setValue(true, true);
  };

  render() {
    return <LaddaButton
      loading={this.state.value}
      onClick={this.handleValueChange}
      className="btn btn-primary">
      {this.state.value ?
        this.props.loadingLabel :
        this.props.label
      }
    </LaddaButton>
  }
}

export default addContextToField(ApiFormSubmitButton)