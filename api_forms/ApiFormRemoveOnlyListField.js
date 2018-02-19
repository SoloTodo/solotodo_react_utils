import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {connect} from "react-redux";
import { apiSettings } from '../settings'
import {NavLink} from "react-router-dom";
import './ApiFormRemoveOnlyListField.css'
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {areListsEqual, listToObject} from "../utils";

class ApiFormRemoveOnlyListField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiResourceObjects: undefined
    }
  }

  componentDidMount() {
    this.componentUpdate(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps);
  }

  componentUpdate = props => {
    const newValue = this.parseValueFromUrl(props);

    if (!areListsEqual(props.value, newValue)) {
      this.notifyNewParams(newValue, props);

      if (newValue.length) {
        let endpoint = apiSettings.apiResourceEndpoints[props.resource] + '?';
        for (const value of newValue) {
          endpoint += `ids=${value}&`
        }

        props.fetchAuth(endpoint)
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

  notifyNewParams(value, props) {
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

    props.onChange(result, true)
  }

  handleItemRemove = (evt, value) => {
    evt.preventDefault();

    const newValues = this.props.value.filter(x => parseInt(x, 10) !== value.id);

    this.notifyNewParams(newValues)
  };

  render() {
    if (!this.props.value || !this.state.apiResourceObjects) {
      return null
    }

    const values = this.props.value.map(value => this.state.apiResourceObjects[value]);

    return <table>
      <tbody>
      {values.map(value => {
        return <tr key={value.id}>
          <td className="pr-2">
            <a href="" className="api-form-remove-only-list-field-remove" onClick={evt => this.handleItemRemove(evt, value)}>
              <i className="fa fa-times" aria-hidden="true">&nbsp;</i>
            </a>
          </td>
          <td>
            <NavLink to={`/${this.props.resource}/${value.id}`}>{value.name}</NavLink>
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

export default connect(mapStateToProps)(ApiFormRemoveOnlyListField);