import React, {Component} from 'react';
import LaddaButton from "react-ladda";
import queryString from "query-string";
import createHistory from 'history/createBrowserHistory'


class ApiFormSubmitButton extends Component {
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

    if (newValue !== this.state.value) {
      this.setState({
        value: newValue
      }, () => {
        this.notifyNewParams(newValue, props, pushUrl)
      })
    }
  }

  componentWillMount() {
    const history = createHistory();
    this.unlisten = history.listen(() => this.componentUpdate());
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

  parseValueFromUrl = () => {
    const parameters = queryString.parse(window.location.search);
    return Boolean(parameters.submit);
  };

  notifyNewParams(value, props, pushUrl=false) {
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

    props.onChange(result, pushUrl)
  }

  handleValueChange = (evt) => {
    evt.preventDefault();
    this.setValue(true, this.props, true);
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

export default ApiFormSubmitButton