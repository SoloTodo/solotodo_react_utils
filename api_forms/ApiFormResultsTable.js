import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import ApiFormOrderingColumn from "./ApiFormOrderingColumn";
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";

class ApiFormResultsTable extends Component {
  render() {
    if (!this.props.results) {
      return this.props.loading || null;
    }

    const results = this.props.results.map((entry, idx) => {
      const result = this.props.ApiResourceObject(entry);
      if (!result.id) {
        result.id = idx + 1
      }
      return result
    });

    const finalColumns = [];

    let i = 1;
    for (const column of this.props.columns) {
      if (column.displayFilter && !column.displayFilter(results)) {
        continue;
      }
      finalColumns.push({
        ...column,
        id: i++
      })
    }

    return <div>
      <table className="table table-striped">
        <thead>
        <tr>
          {finalColumns.map(column => (
              <th key={column.id} className={column.cssClasses}>
                <ApiFormOrderingColumn
                    name={column.ordering}
                    label={column.label}
                    ordering={this.props.ordering}
                />
              </th>
          ))}

        </tr>
        </thead>
        <tbody>
        {results.length ? results.map(entry => {
            let extraClasses = "";
            if(this.props.getExtraClasses){
              extraClasses = this.props.getExtraClasses(entry);
            }
            return <tr key={entry.id} className={extraClasses}>
              {finalColumns.map(column => (
                  <td key={column.id} className={column.cssClasses}>
                    {column.renderer ? column.renderer(entry) : entry[column.field]}
                  </td>))}
            </tr>
        }) : <tr>
          <td colSpan="10" className="text-center">
            <em><FormattedMessage id="no_results_found" defaultMessage="No results found"/></em>
          </td>
        </tr>}
        </tbody>
      </table>
    </div>
  }
}


function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
  }
}

export default connect(mapStateToProps)(ApiFormResultsTable);