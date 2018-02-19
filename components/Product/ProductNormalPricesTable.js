import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip'

class ProductNormalPricesTable extends Component {
  render() {
    const LeadLinkComponent = this.props.leadLinkComponent;

    return <table className="table table-sm mb-0">
      <thead>
      <tr>
        <th scope="col">Tienda</th>
        <th scope="col" className="text-right">
          <ReactTooltip id="offer-price" type="info" effect="solid" place="top">
            <span>Con el medio de pago preferido de la tienda</span>
          </ReactTooltip>
          <span data-tip data-for='offer-price' className="tooltip-span">Precio oferta</span>
        </th>
        <th scope="col" className="text-right">
          <ReactTooltip id="normal-price" type="info" effect="solid" place="top">
            <span>Con cualquier medio de pago</span>
          </ReactTooltip>
          <span data-tip data-for='normal-price' className="tooltip-span">Precio normal</span>
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
      )) : <tr>
        <td colSpan="4">Este producto no está disponible actualmente</td>
      </tr>}
      </tbody>
    </table>
  }
}

export default ProductNormalPricesTable;
