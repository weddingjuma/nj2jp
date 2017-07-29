import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import {
  NameOnCard,
  CreditCardNumber,
  CreditCardExpiration,
  CreditCardCvn,
} from './component.imports';

const { func } = PropTypes;

class CreditCardInfo extends PureComponent {
  static propTypes = {
    toggleModal: func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      ccNameOnCard: '',
      ccNumber: '',
      ccExpireMonth: '',
      ccExpireYear: '',
      ccCvn: '',
    };
  }

  handleOnChange = e => this.setState({ [e.target.name]: e.target.value })

  render() {
    const {
      ccNameOnCard,
    } = this.state;

    return (
      <div className="checkout__credit-card">
        <div className="title">
          <h3>Credit Card Information</h3>
        </div>

        <div className="input__row">
          <div className="input__row--cc-type">
            <p>Accepted Credit Card Types</p>
            <div className="types">
              <FontAwesome name="cc-visa" />
              <FontAwesome name="cc-mastercard" />
              <FontAwesome name="cc-discover" />
              <FontAwesome name="cc-amex" />
            </div>
          </div>
        </div>

        <NameOnCard
          ccNameOnCard={this.ccNameOnCard}
          handleOnChange={this.handleOnChange}
        />

        <CreditCardNumber />

        <CreditCardExpiration />

        <CreditCardCvn toggleModal={this.props.toggleModal} />
      </div>
    );
  }
}
export default CreditCardInfo;
