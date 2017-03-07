import React from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import uuid from 'uuid';


export default function OrderSuccess() {
  return (
    <div className="ordered--main">
      <div className="ordered--container">
        <div className="ordered__title">
          <div className="title--icon">
            <FontAwesome name="question-circle" />
          </div>
          <div className="title--msg">
            <h1>Your order has been successfully placed!</h1>
            <h4>The invoice shown below has been sent to your email.</h4>
          </div>
        </div>
        <div className="ordered__header">
          <div className="header--date">
            <p>Date: {moment().format('LLLL')}</p>
            <p>Invoice #: {uuid()}</p>
          </div>
          <div className="header--status">
            {'<Shipping Status>'}
          </div>
          <div className="header--info">
            <div className="header__tracking">
              <p>Tracking #: {uuid()}</p>
              <p>Order #: {uuid()}</p>
            </div>
            <div className="header__price">
              Price: <FontAwesome name="usd" />{'\u00A0'}32.14
            </div>
          </div>
        </div>
        <div className="ordered__addresses">
          <div className="addresses--shipto">
            <fieldset className="shipto--fieldset">
              <legend className="shipto__legend">Ship To</legend>
              <div className="shipto__name">
                <p className="name--firstName">Bruce</p>
                <p className="name--lastName">Wayne</p>
              </div>
              <div className="shipto__address">
                <p>{'<Address>'}</p>
              </div>
              <div className="shipto__city-prefecture">
                <p className="city-prefecture--city">{'<City>'}</p>
                <p className="city-prefecture--prefecture">{'<Prefecture>'}</p>
              </div>
              <div className="shipto__postal-code">
                <p>{'<Postal Code>'}</p>
              </div>
              <div className="shipto__country">
                <p>Japan</p>
              </div>
              <div className="shipto__telephone">
                <p className="telephone--area-code">({'<area code>'}){'\u2013'}</p>
                <p className="telephone--first-half">
                  {'\u00A0'}{'<first half>'}{'\u2013'}
                </p>
                <p className="telephone--second-half">
                  {'\u00A0'}{'<second half>'}
                </p>
              </div>
            </fieldset>
          </div>
          <div className="addresses--billto">
            <fieldset className="billto--fieldset">
              <legend className="billto__legend">Bill To</legend>
              <div className="billto__name">
                <p className="name--firstName">Bruce</p>
                <p className="name--lastName">Wayne</p>
              </div>
              <div className="billto__address">
                <p>{'<Address>'}</p>
              </div>
              <div className="billto__city-prefecture">
                <p className="city-prefecture--city">{'<City>'}</p>
                <p className="city-prefecture--prefecture">{'<Prefecture>'}</p>
              </div>
              <div className="billto__postal-code">
                <p>{'<Postal Code>'}</p>
              </div>
              <div className="billto__country">
                <p>Japan</p>
              </div>
              <div className="billto__telephone">
                <p className="telephone--area-code">({'<area code>'}){'\u2013'}</p>
                <p className="telephone--first-half">
                  {'\u00A0'}{'<first half>'}{'\u2013'}
                </p>
                <p className="telephone--second-half">
                  {'\u00A0'}{'<second half>'}
                </p>
              </div>
              <div className="billto__card-info">
                <p>Credit Card #: ************{'<last-four>'}</p>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="ordered__order-summary">
          <fieldset className="order-summary--fieldset">
            <legend className="order-summary--legend">Order Summary</legend>
            <table className="order-summary__table" cellPadding="0" cellSpacing="0">
              <thead className="table--thead">
                <tr>
                  <td colSpan="1">
                    <p>Qty</p>
                  </td>
                  <td colSpan="3">
                    <p>Juice Description</p>
                  </td>
                  <td colSpan="2">
                    <p>Price</p>
                  </td>
                </tr>
              </thead>
              <tbody className="table--body">
                <tr className="body--shipping-status-row">
                  <td colSpan="4">
                    <p>{'<Shipping Status>'} {'\u2013'} Tracking #:
                      {/* TODO: These query params need to be dynamically assigned. */}
                      <Link to="/user:123123123/orders:123123/tracking:123123123">
                        {uuid()}
                      </Link>
                    </p>
                  </td>
                </tr>
                <tr className="body--product-row">
                  <td>
                    <p>{'<Qty>'}</p>
                  </td>
                  <td>
                    <ul className="product-row__list">
                      <li className="list--title">
                        <p>{'<Product Description>'}</p>
                      </li>
                      <li className="list--nic-strength">
                        <p>{'<Nic Strength>'}{'\u00A0'}mg</p>
                      </li>
                      <li className="list--sku">
                        <p>SKU: {uuid()}</p>
                      </li>
                    </ul>
                  </td>
                  <td>
                    <p>
                      <FontAwesome name="usd" />{'\u00A0'}
                      {'<Price>'}.00
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
