import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip'
import RatingStars from "../RatingStars";
import EntityRefurbishedWarning from "../Entity/EntityRefurbishedWarning";

class ProductNormalPricesTable extends Component {
  render() {
    const LeadLinkComponent = this.props.leadLinkComponent;

    return <table className="table table-sm mb-0">
      <thead>
      <tr>
        <th scope="col">Tienda</th>
        {this.props.displayStoreRatings && <th scope="col">Rating</th>}
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
      {this.props.entities.length ? this.props.entities.map(entity => (
          <tr key={entity.id}>
            <td>
              <LeadLinkComponent entity={entity} className="normal-table-product-link">
                {entity.store.name}
              </LeadLinkComponent>

              <EntityRefurbishedWarning entity={entity} />
            </td>
            {this.props.displayStoreRatings &&
            <td>
              <RatingStars
                  value={this.props.storeRatings[entity.storeUrl] || 0}
                  linkUrl={`/stores/${entity.store.id}/ratings`}
              />
            </td>
            }
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
      )) : <tr>
        <td colSpan="4">Este producto no está disponible actualmente</td>
      </tr>}
      </tbody>
    </table>
  }
}

export default ProductNormalPricesTable;
