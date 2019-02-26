import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {connect} from "react-redux";
import { apiSettings } from '../settings'
import {NavLink, withRouter} from "react-router-dom";
import './ApiFormRemoveOnlyListField.css'
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {areListsEqual, listToObject} from "../utils";

class ApiFormRemoveOnlyListField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiResourceObjects: undefined,
      value: this.parseValueFromUrl(props)
    };
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (!props.onChange) {
      return
    }

    if (!areListsEqual(this.state.value, newValue)) {
      this.setState({
        value: newValue
      }, () => this.notifyNewParams(newValue, props, pushUrl));
    }
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen(() => this.componentUpdate());
    this.componentUpdate();

    if (this.state.value.length) {
      let endpoint = apiSettings.apiResourceEndpoints[this.props.resource] + '?';
      for (const value of this.state.value) {
        endpoint += `ids=${value}&`
      }
      this.props.fetchAuth(endpoint)
          .then(json => {
            const apiResourceObjects = listToObject(json.results, 'id');
            this.setState({
              apiResourceObjects
            })
          })
    } else {
      this.setState({apiResourceObjects: {}})
    }
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
    const parameters = queryString.parse(window.location.search);

    let values = parameters[changeCase.snake(props.name)];

    if (typeof(values) === 'undefined') {
      values = []
    }

    if (!Array.isArray(values)) {
      values = [values]
    }

    return values
  };

  notifyNewParams(value, props, pushUrl) {
    props = props || this.props;

    if (!props.onChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);

    const params = value ? {[fieldName] : value} : {};

    const result = {
      [this.props.name]: {
        apiParams: params,
        urlParams: params,
        fieldValues: value
      }
    };

    props.onChange(result, pushUrl)
  }

  handleItemRemove = (evt, value) => {
    evt.preventDefault();

    const newValues = this.state.value.filter(x => parseInt(x, 10) !== value.id);

    this.setValue(newValues, this.props, true)
  };

  render() {
    if (!this.state.value || !this.state.apiResourceObjects) {
      return null
    }

    const values = this.state.value.map(value => this.state.apiResourceObjects[value]);

    return <table>
      <tbody>
      {values.map(value => {
        return <tr key={value.id}>
          <td className="pr-2">
            <a href="/" className="api-form-remove-only-list-field-remove" onClick={evt => this.handleItemRemove(evt, value)}>
              <i className="fa fa-times" aria-hidden="true">&nbsp;</i>
            </a>
          </td>
          <td>
            <NavLink to={`/${this.props.resource}/${value.id}`}>{value.name || value.id}</NavLink>
          </td>
        </tr>
      })}
      </tbody>
    </table>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
  }
}

export default withRouter(connect(mapStateToProps)(ApiFormRemoveOnlyListField));