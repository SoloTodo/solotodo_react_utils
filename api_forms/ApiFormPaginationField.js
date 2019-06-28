import React, {Component} from 'react'
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import {connect} from "react-redux";
import {addContextToField} from "./utils";

export class ApiFormPaginationField extends Component {
  constructor(props) {
    super(props);

    const initialValue = props.initialValue || ApiFormPaginationField.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    if (!props.initialValue) {
      ApiFormPaginationField.notifyNewParams(initialValue, props, false);
    }
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (this.state.value.id !== newValue.id) {
      this.setState({
        value: newValue
      }, () => ApiFormPaginationField.notifyNewParams(newValue, props, pushUrl))
    }
  }

  routeChangeHandler = () => {
    const newValue = ApiFormPaginationField.parseValueFromUrl(this.props);
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

  static parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);
    let value = parseInt(parameters['page'], 10);

    if (Number.isNaN(value)) {
      return {
        id: 1,
        name: ''
      }
    }

    return {
        id: value,
        name: ''
      }
  };

  static getNotificationValue(value) {
    const params = {};

    if (value && value.id !== 1) {
      params['page'] = [value.id]
    }

    return {
      page: {
        apiParams: params,
        urlParams: params,
        fieldValues: value
      }
    };
  }

  static notifyNewParams(value, props, pushUrl) {
    const result = this.getNotificationValue(value);
    props.onChange(result, pushUrl)
  }

  onPageChange = (selection) => {
    this.setValue({id: selection.selected + 1, name:''}, this.props, true)
  };

  render() {
    if (!this.props.resultCount) {
      return null
    }

    const pageRangeDisplayed = this.props.isExtraSmall ? 2 : 3;
    const marginPagesDisplayed = this.props.isExtraSmall ? 1 : 2;

    let pageCount = 1;
    if (this.props.pageSize) {
      pageCount = Math.ceil(this.props.resultCount / this.props.pageSize.id);
    }

    const page = this.state.value ? this.state.value.id : 1;

    const previousLabel = this.props.previousLabel || <span>&lsaquo;</span>;
    const nextLabel = this.props.nextLabel || <span>&rsaquo;</span>;

    return <ReactPaginate
        forcePage={page - 1}
        pageCount={pageCount}
        pageRangeDisplayed={pageRangeDisplayed}
        marginPagesDisplayed={marginPagesDisplayed}
        containerClassName="pagination"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        activeClassName="active"
        previousClassName="page-item"
        nextClassName="page-item"
        previousLinkClassName="page-link"
        nextLinkClassName="page-link"
        disabledClassName="disabled"
        hrefBuilder={page => `?page=${page}`}
        onPageChange={this.onPageChange}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
    />
  }
}

function mapStateToProps(state) {
  return {
    isExtraSmall: state.browser.is.extraSmall,
  }
}

const ApiFormPaginationFieldWithContext = addContextToField(ApiFormPaginationField);
export default connect(mapStateToProps)(ApiFormPaginationFieldWithContext)
