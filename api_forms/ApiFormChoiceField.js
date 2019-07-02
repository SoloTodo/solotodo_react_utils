import React from 'react'
import Select from "react-select";
import queryString from 'query-string';
import {createOption, createOptions} from "../form_utils";
import changeCase from 'change-case'
import {areValuesEqual} from "../utils";
import {addContextToField} from "./utils";


export class ApiFormChoiceField extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormChoiceField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (typeof props.initialValue === 'undefined') {
      ApiFormChoiceField.notifyNewParams(initialValue, props, false);
    }
  }

  routeChangeHandler = () => {
    const newValue = ApiFormChoiceField.parseValueFromUrl(this.props);
    this.setValue(newValue, this.props);
  };

  componentDidMount() {
    if (this.props.router) {
      this.props.router.events.on('routeChangeComplete', this.routeChangeHandler)
    } else {
      this.unlisten = this.props.history.listen(this.routeChangeHandler);
    }
  }

  componentWillUnmount() {
    if (this.props.router) {
      this.props.router.events.off('routeChangeComplete', this.routeChangeHandler)
    } else {
      this.unlisten();
    }
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (!areValuesEqual(this.state.value, newValue, 'id')) {
      this.setState({
        value: newValue
      }, () => ApiFormChoiceField.notifyNewParams(newValue, props, pushUrl))
    }
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);
    const urlField = props.urlField || changeCase.snake(props.name);
    let valueIds = parameters[urlField];
    const choices = ApiFormChoiceField.sanitizeChoices(props);

    if (props.multiple) {
      if (!valueIds) {
        valueIds = []
      } else if (!Array.isArray(valueIds)) {
        valueIds = [valueIds]
      }

      return choices.filter(choice => valueIds.includes(choice.id));
    } else {
      let valueId = undefined;

      if (!valueIds) {
        valueId = null;
      } else if (Array.isArray(valueIds)) {
        valueId = valueIds[0]
      } else {
        valueId = valueIds
      }

      const initialValueId =
          props.initial ? props.initial :
              props.required ? choices[0].id : null;

      if (!valueId) {
        valueId = initialValueId
      }

      let value = undefined;

      if (valueId === null) {
        value = null
      } else {
        value = choices.filter(choice => choice.id === valueId)[0];
      }

      return value
    }
  };

  static getNotificationValue(valueOrValues, props) {
    let values = undefined;

    if (valueOrValues) {
      if (Array.isArray(valueOrValues)) {
        values = valueOrValues
      } else {
        values = [valueOrValues]
      }
    } else {
      values = []
    }

    const valueIds = values.map(value => value.id);
    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (values.length && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = valueIds
    }

    const apiParams = {};
    if (values.length && props.apiField !== null) {
      apiParams[props.apiField || fieldName] = valueIds
    }

    if (values.length && props.additionalApiFields) {
      for (const field of props.additionalApiFields) {
        const paramName = changeCase.snake(field);
        const paramValue = values.map(x => x[field]);
        if (paramValue.some(x => Boolean(x))) {
          apiParams[paramName] = paramValue
        }
      }
    }

    return {
      [props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: valueOrValues
      }
    };
  }

  static notifyNewParams(valueOrValues, props, pushUrl) {
    const result = this.getNotificationValue(valueOrValues, props);
    props.onChange(result, pushUrl)
  }

  handleValueChange = vals => {
    let sanitizedValue = null;
    if (this.props.multiple) {
      const choices = ApiFormChoiceField.sanitizeChoices(this.props);
      const sanitizedValueIds = vals.map(val => val.value);
      sanitizedValue = choices.filter(choice => sanitizedValueIds.includes(choice.id));
    } else if (vals) {
      sanitizedValue = vals.option
    }

    this.setValue(sanitizedValue, this.props, true)
  };

  static sanitizeChoices(props) {
    return props.choices.map(choice => ({...choice, id: choice.id.toString()}))
  }

  render() {
    let selectedChoices = null;

    const choices = ApiFormChoiceField.sanitizeChoices(this.props);

    if (this.props.multiple) {
      if (this.state.value) {
        const valueIds = this.state.value.map(value => value.id);
        selectedChoices = choices.filter(choice => valueIds.includes(choice.id))
      } else {
        selectedChoices = []
      }
      selectedChoices = createOptions(selectedChoices);
    } else {
      if (this.state.value) {
        const matchingChoice = choices.filter(choice => choice.id === this.state.value.id)[0] || null;
        if (matchingChoice) {
          selectedChoices = createOption(matchingChoice)
        }
      }
    }

    if (this.props.hidden) {
      return null
    } else {
      return <Select
          className="react-select"
          name={this.props.name}
          id={this.props.name}
          options={createOptions(choices)}
          value={selectedChoices}
          onChange={this.handleValueChange}
          multi={this.props.multiple}
          isMulti={this.props.multiple}
          placeholder={this.props.placeholder}
          searchable={this.props.searchable}
          isSearchable={this.props.searchable}
          clearable={!this.props.required}
          isClearable={!this.props.required}
          autoBlur={true}
      />
    }
  }
}

export default addContextToField(ApiFormChoiceField)