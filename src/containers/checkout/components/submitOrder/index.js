import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Validation from 'react-validation';
import FontAwesome from 'react-fontawesome';
import {
  squarePaymentForm as SqrPaymentForm,
} from './utilities.imports';

// let paymentForm = {};

class SubmitOrder extends React.PureComponent {
  static propTypes = {
    enable: PropTypes.bool.isRequired,
    ccCountry: PropTypes.string.isRequired,
    ccRenderKey: PropTypes.string.isRequired,
    // handleNonceResponse: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);

    this.state = {
      ccCountry: props.ccCountry,
      ccRenderKey: props.ccRenderKey,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      ccCountry,
      ccRenderKey,
    } = nextProps;

    if (!_.isEqual(nextProps, this.props)) {
      this.setState({
        ccCountry,
        ccRenderKey,
      });
    }
  }

  handleOnSubmit = () => {
    SqrPaymentForm.get().requestCardNonce();
  }

  render() {
    const {
      enable,
      ccRenderKey,
    } = this.props;

    return (
    enable ?
      <div className="checkout__purchase-btn" >
        {/* <button onClick={() => this.state.paymentForm.destroy()}>Destroy</button>
          <button onClick={() => {
          this.state.paymentForm = SqrPaymentForm('renderWithZip', this.props.handleNonceResponse);
          this.state.paymentForm.build();
          }}>Build US</button>
          <button onClick={() => {
          this.state.paymentForm = SqrPaymentForm('renderWithoutZip', this.props.handleNonceResponse);
          this.state.paymentForm.build();
        }}>Build Non-US</button> */}
        <Validation.components.Button
          className="button"
          errorClassName="asd"
          onClick={this.handleOnSubmit}
        >
          <span className="btn-flex-parent">
            <FontAwesome name="barcode" />
            {'\u00A0'}
            <p>Place Order Now</p>
          </span>
        </Validation.components.Button>
      </div>
        :
      <div className="checkout__purchase-btn">
        <button className="button" disabled>
          <span className="btn-flex-parent">
            <FontAwesome name="barcode" />
            {'\u00A0'}
            <p>Place Order Now</p>
          </span>
        </button>
      </div>
    );
  }
}

export default SubmitOrder;
