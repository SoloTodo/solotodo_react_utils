import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip'
import RatingStars from "../RatingStars";
import EntityRefurbishedWarning from "../Entity/EntityRefurbishedWarning";

class ProductCellPricesTable extends Component {
  render() {
    const groupedEntities = [];

    for (const entity of this.props.entities) {
      const filteredGroup = groupedEntities.filter(group => (group.store.id === entity.store.id))[0];
      if (filteredGroup) {
        filteredGroup.entities.push(entity)
      } else {
        groupedEntities.push(
            {
              store: entity.store,
              entities: [entity]
            }
        )
      }
    }

    const LeadLinkComponent = this.props.leadLinkComponent;

    let tableRows = [];
    for (const group of groupedEntities) {
      tableRows.push(
          <tr key={group.store.url}>
            <td colSpan="3">
              <div className="d-flex flex-row">
                <span className="mr-2">{group.store.name}</span>
                <RatingStars
                    value={this.props.storeRatings[group.store.url] || 0}
                    linkUrl={`/stores/${group.store.id}/ratings`}
                />
              </div>
            </td>
          </tr>
      );
      for (const entity of group.entities) {
        tableRows.push(<tr key={entity.url}>
              <td>
                <LeadLinkComponent entity={entity} className="cellphone-table-product-link pl-2">
                  {entity.cellPlan ? entity.cellPlan.name : "Liberado"}
                </LeadLinkComponent>

                <EntityRefurbishedWarning entity={entity} />
              </td>
              <td className="text-right">
                <LeadLinkComponent entity={entity} className="price-container">
                  {this.props.priceFormatter(entity.activeRegistry.offer_price, entity.currency)}
                </LeadLinkComponent>
              </td>
              <td className="text-right">
                <LeadLinkComponent entity={entity} className="price-container">
                  {this.props.priceFormatter(entity.activeRegistry.normal_price, entity.currency)}
                </LeadLinkComponent>
              </td>
            </tr>
        )
      }
    }

    return <table className="table table-sm mb-0">
      <thead>
      <tr>
        <th scope="col">Tienda</th>
        <th scope="col" className="text-right">
          <ReactTooltip id="offer-price" type="info" effect="solid" place="top">
            <span>Con el medio de pago preferido de la tienda</span>
          </ReactTooltip>
          <span data-tip data-for='offer-price' className="tooltip-span">P. oferta</span>
        </th>
        <th scope="col" className="text-right">
          <ReactTooltip id="normal-price" type="info" effect="solid" place="top">
            <span>Con cualquier medio de pago</span>
          </ReactTooltip>
          <span data-tip data-for='normal-price' className="tooltip-span">P. normal</span>
        </th>
      </tr>
      </thead>
      <tbody>
      {
        groupedEntities.length ? tableRows.map(row => row) : <tr>
          <td colSpan="4">Este producto no está disponible actualmente</td>
        </tr>
      }
      </tbody>
    </table>
  }
}

export default ProductCellPricesTable;
