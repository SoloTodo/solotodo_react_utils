import React from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {connect} from "react-redux";
import { apiSettings } from '../settings'
import './ApiFormRemoveOnlyListField.css'
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {areListsEqual, listToObject} from "../utils";
import {addContextToField} from "./utils";


class ApiFormRemoveOnlyListField extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormRemoveOnlyListField.parseValueFromUrl(props);

    this.state = {
      apiResourceObjects: undefined,
      value: initialValue
    };

    if (typeof props.initialValue === 'undefined') {
      ApiFormRemoveOnlyListField.notifyNewParams(initialValue, props, false);
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      const newValue = ApiFormRemoveOnlyListField.parseValueFromUrl(this.props);
      this.setValue(newValue, this.props);
    });

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

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (!areListsEqual(this.state.value, newValue)) {
      this.setState({
        value: newValue
      }, () => ApiFormRemoveOnlyListField.notifyNewParams(newValue, props, pushUrl));
    }
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);

    let values = parameters[changeCase.snake(props.name)];

    if (typeof(values) === 'undefined') {
      values = []
    }

    if (!Array.isArray(values)) {
      values = [values]
    }

    return values
  };

  static getNotificationValue(value, props) {
    const fieldName = changeCase.snake(props.name);

    const params = value ? {[fieldName] : value} : {};

    return {
      [props.name]: {
        apiParams: params,
        urlParams: params,
        fieldValues: value
      }
    };
  }

  static notifyNewParams(value, props, pushUrl) {
    const result = this.getNotificationValue(value, props);
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
            <a href={`/${this.props.resource}/${value.id}`}>{value.name || value.id}</a>
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

export default connect(mapStateToProps)(addContextToField(ApiFormRemoveOnlyListField));