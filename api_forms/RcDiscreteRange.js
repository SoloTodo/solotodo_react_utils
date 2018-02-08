import React, {Component} from 'react'
import {Range} from "rc-slider";

/**
 * We need to wrap rc-slider to allow moving the handles without changing the
 * ApiForm values, the values are only commited to ApiForm when the user lets
 * go of the handle
 */

class RcDiscreteRange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startValue: props.value[0],
      endValue: props.value[1]
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.value[0] !== newProps.value[0] || this.props.value[1] !== newProps.value[1]) {
      this.setState({
        startValue: newProps.value[0],
        endValue: newProps.value[1]
      })
    }
  }

  onChange = values => {
    this.setState({
      startValue: values[0],
      endValue: values[1]
    })
  };

  render() {
    const startValue = this.state.startValue || this.props.min;
    const endValue = this.state.endValue || this.props.max;

    return <Range
        marks={this.props.marks}
        min={this.props.min}
        max={this.props.max}
        value={[startValue, endValue]}
        onChange={this.onChange}
        step={null}
        onAfterChange={this.props.onAfterChange}
        handle={this.props.handle}
        allowCross={false}
    />
  }
}

export default RcDiscreteRange;