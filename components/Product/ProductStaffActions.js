import React, {Component} from 'react'
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu
} from 'reactstrap';
import {apiSettings} from "../../settings";
import {apiResourceStateToPropsUtils} from "../../ApiResource";
import {connect} from "react-redux";
import {toast} from "react-toastify";

class ProductStaffActions extends Component {
  cloneProduct = evt => {
    evt.preventDefault();
    toast.info('Clonando...');
    this.props.fetchAuth(`products/${this.props.product.id}/clone/`, {method: 'POST'}).then(response => (
      window.location = `${apiSettings.endpoint}metamodel/instances/${response.instance_id}`
    ));
  };

  render() {
    return <div className="mr-2 mt-2">
    <UncontrolledDropdown>
      <DropdownToggle color="success" caret>
        Opciones
      </DropdownToggle>
      <DropdownMenu>
        <a
          href={`${apiSettings.endpoint}metamodel/instances/${this.props.product.instanceModelId}`}
          target="_blank"
          className="dropdown-item"
        >
          Editar producto
        </a>
        <a
          href=""
          className="dropdown-item"
          onClick={this.cloneProduct}
        >
          Clonar
        </a>
        <a
          href={`${apiSettings.backendUrl}products/${this.props.product.id}`}
          target="_blank"
          className="dropdown-item"
        >
          Ver en backend
        </a>
      </DropdownMenu>
    </UncontrolledDropdown>
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth
  }
}

export default connect(mapStateToProps)(ProductStaffActions)
