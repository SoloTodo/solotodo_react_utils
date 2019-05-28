import React, {Component} from 'react'
import ApiFormChoiceField from "./ApiFormChoiceField";
import {createPageSizeChoices} from "./utils";
import ApiFormPaginationField from "./ApiFormPaginationField";
import ApiFormResultsTable from "./ApiFormResultsTable";
import ApiFormResultPageCount from "./ApiFormResultPageCount";

class ApiFormResultTableWithPagination extends Component {
  render() {
    return (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className={this.props.icon || "glyphicons glyphicons-list"}/> {this.props.label}</span>
            <div>
              <ApiFormResultPageCount
              page={this.props.page}
              pageSize={this.props.page_size}
              resultCount={this.props.data && this.props.data.count}/>
              {this.props.headerButton}
            </div>
          </div>
          <div className={this.props.cardClass || "card-block"} id="results-container">
            <div className="d-flex justify-content-between flex-wrap align-items-center mb-3 api-form-filters">
              <div className="d-flex results-per-page-fields align-items-center mr-3">
                <div className="results-per-page-dropdown ml-0 mr-2">
                  <ApiFormChoiceField
                      name="page_size"
                      choices={createPageSizeChoices(this.props.page_size_choices)}
                      value={this.props.page_size}
                      required={true}
                      searchable={false}
                  />
                </div>
                <label>Resultados por página</label>
              </div>
              <div className="pagination-fields ml-auto d-flex align-items-center mr-0">
                <ApiFormPaginationField
                    page={this.props.page}
                    pageSize={this.props.page_size}
                    resultCount={this.props.data && this.props.data.count}
                />
              </div>
            </div>

            <ApiFormResultsTable
                results={this.props.data && this.props.data.results}
                columns={this.props.columns}
                ordering={this.props.ordering}
                loading={this.props.loading}
                getExtraClasses={this.props.getExtraClasses}
            />
          </div>
        </div>);
  }
}

export default ApiFormResultTableWithPagination;