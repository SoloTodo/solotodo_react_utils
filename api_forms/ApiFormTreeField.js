import React from 'react'
import TreeMenu from 'react-simple-tree-menu';
import queryString from 'query-string';
import {createOption, createOptions} from "../form_utils";
import changeCase from 'change-case'
import {areValuesEqual} from "../utils";
import {addContextToField} from "./utils";


export class ApiFormTreeField extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormTreeField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (typeof props.initialValue === 'undefined') {
      ApiFormTreeField.notifyNewParams(initialValue, props, false);
    }
  }

  routeChangeHandler = () => {
    const newValue = ApiFormTreeField.parseValueFromUrl(this.props);
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
      }, () => ApiFormTreeField.notifyNewParams(newValue, props, pushUrl))
    }
  }

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);
    const urlField = props.urlField || changeCase.snake(props.name);
    let valueIds = parameters[urlField];
    const choices = ApiFormTreeField.sanitizeChoices(props);

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
    if (vals) {
      sanitizedValue = [{
        id: vals.id
      }]
    }

    this.setValue(sanitizedValue, this.props, true)
  };

  static sanitizeChoices(props) {
    return props.choices.map(choice => ({...choice, id: choice.id.toString()}))
  }

  render() {
    let selectedChoices = null;

    const choices = ApiFormTreeField.sanitizeChoices(this.props);
    const treeData = {}

    function addNode(to, nodeLabels, nodeId) {
      if (nodeLabels.length === 0) {
        return
      }

      const firstLabel = nodeLabels[0]
      const otherLabels = nodeLabels.slice(1)

      if (to[firstLabel]) {
        addNode(to[firstLabel]['nodes'], otherLabels, nodeId)
      } else {
        to[firstLabel] = {
          id: null,
          label: firstLabel,
          nodes: {}
        }

        if (otherLabels.length > 0) {
          addNode(to[firstLabel]['nodes'], otherLabels, nodeId)
        } else {
          to[firstLabel].id = nodeId
        }
      }
    }

    for (const choice of choices) {
      const choice_labels = choice.name.split(' > ')
      addNode(treeData, choice_labels, choice.id)
    }

    if (this.state.value && this.state.value.length) {
      const matchingChoice = choices.filter(choice => choice.id === this.state.value[0].id)[0] || null;
      if (matchingChoice) {
        selectedChoices = matchingChoice.name.split(' > ').join('/')
      }
    }

    if (this.props.hidden) {
      return null
    } else {
      return <TreeMenu
          data={treeData}
          onClickItem={this.handleValueChange}
          activeKey={selectedChoices}
          openNodes={selectedChoices && selectedChoices.split('/')}
          hasSearch={false}
      />

      // return <Select
      //     className="react-select"
      //     name={this.props.name}
      //     id={this.props.name}
      //     options={createOptions(choices)}
      //     value={selectedChoices}
      //     onChange={this.handleValueChange}
      //     multi={this.props.multiple}
      //     isMulti={this.props.multiple}
      //     placeholder={this.props.placeholder}
      //     searchable={this.props.searchable}
      //     isSearchable={this.props.searchable}
      //     clearable={!this.props.required}
      //     isClearable={!this.props.required}
      //     autoBlur={true}
      // />
    }
  }
}

export default addContextToField(ApiFormTreeField)