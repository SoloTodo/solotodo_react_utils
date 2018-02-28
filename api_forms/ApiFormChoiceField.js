import React, {Component} from 'react'
import Select from "react-select";
import queryString from 'query-string';
import {createOption, createOptions} from "../form_utils";
import changeCase from 'change-case'
import {areValuesEqual} from "../utils";
import {withRouter} from "react-router-dom";


class ApiFormChoiceField extends Component {
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

    if (!areValuesEqual(this.state.value, newValue, 'id')) {
      this.setState({
        value: newValue
      }, () => this.notifyNewParams(newValue, props, pushUrl))
    }
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen(() => this.componentUpdate());
    this.componentUpdate();
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.onChange && nextProps.onChange) {
      this.notifyNewParams(this.state.value, nextProps)
    } else {
      this.componentUpdate(nextProps)
    }

  }

  componentUpdate = props => {
    props = props || this.props;

    const newValue = this.parseValueFromUrl(props);
    this.setValue(newValue, props);
  };

  parseValueFromUrl = props => {
    props = props || this.props;

    const parameters = queryString.parse(window.location.search);
    const urlField = props.urlField || changeCase.snake(props.name);
    let valueIds = parameters[urlField];
    const choices = this.sanitizeChoices(props);

    if (props.multiple) {
      if (!valueIds) {
        valueIds = []
      } else if (!Array.isArray(valueIds)) {
        valueIds = [valueIds]
      }

      return choices.filter(choice => valueIds.includes(choice.id))
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

  notifyNewParams(valueOrValues, props, pushUrl) {
    props = props || this.props;

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

    const result = {
      [this.props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: valueOrValues
      }
    };

    props.onChange(result, pushUrl)
  }

  handleValueChange = (vals) => {
    let sanitizedValue = null;
    if (this.props.multiple) {
      sanitizedValue = vals.map(val => val.option)
    } else if (vals) {
      sanitizedValue = vals.option
    }

    this.setValue(sanitizedValue, this.props, true)
  };

  sanitizeChoices(props) {
    return props.choices.map(choice => ({...choice, id: choice.id.toString()}))
  }

  render() {
    let selectedChoices = null;

    const choices = this.sanitizeChoices(this.props);

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
          name={this.props.name}
          id={this.props.name}
          options={createOptions(choices)}
          value={selectedChoices}
          onChange={this.handleValueChange}
          multi={this.props.multiple}
          placeholder={this.props.placeholder}
          searchable={this.props.searchable}
          clearable={!this.props.required}
          autoBlur={true}
      />
    }
  }
}

export default withRouter(ApiFormChoiceField)