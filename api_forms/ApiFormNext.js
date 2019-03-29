import React from 'react';
import ApiForm from "./ApiForm";

class ApiFormNext extends React.Component {
  static async getInitialProps(processedFormLayout, asPath, endpoints, fetchFunction) {
    const {filtersLayout, ordering, pagination} = processedFormLayout;

    const initialFormData = {};

    filtersLayout.map(fieldset => {
      fieldset.filters.map(filter => {
        const filterInitialProps = filter.component.getInitialProps(filter.props, asPath);
        Object.assign(initialFormData, filterInitialProps)
      })
    });

    Object.assign(initialFormData, ordering.component.getInitialProps(ordering.props, asPath));
    Object.assign(initialFormData, pagination.component.getInitialProps(pagination.props, asPath));
    const initialSearchResults = await ApiForm.getSearchResults(initialFormData, endpoints, fetchFunction);

    return {
      initialFormData,
      initialSearchResults
    }
  }

  render() {
    return <ApiForm {...this.props} />
  }
}

export default ApiFormNext;