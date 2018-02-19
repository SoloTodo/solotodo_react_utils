import React, {Component} from 'react';
import LaddaButton from "react-ladda";
import queryString from "query-string";

class ApiFormSubmitButton extends Component {
  componentWillMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps)
  }

  componentUpdate = props => {
    const newValue = this.parseValueFromUrl();

    if (props.value !== newValue) {
      this.notifyNewParams(newValue, props);
    }
  };

  parseValueFromUrl = () => {
    const parameters = queryString.parse(window.location.search);
    return Boolean(parameters.submit);
  };

  notifyNewParams(value, props) {
    props = props || this.props;

    if (!props.onChange) {
      return;
    }

    const result = {
      submit: {
        apiParams: {submit: []},
        urlParams: value ? {submit: [1]} : {submit: []},
        fieldValues: value
      }
    };

    props.onChange(result)
  }

  handleValueChange = (evt) => {
    evt.preventDefault();

    this.notifyNewParams(true, this.props)
  };

  render() {
    return <LaddaButton
        loading={this.props.loading}
        onClick={this.handleValueChange}
        className="btn btn-primary">
      {this.props.loading ?
          this.props.loadingLabel :
          this.props.label
      }
    </LaddaButton>
  }
}

export default ApiFormSubmitButton