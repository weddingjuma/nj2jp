import React from 'react';
import FontAwesome from 'react-fontawesome';

function RegisterModal({ showModal, toggleModal }) {
  let style;
  if (showModal) {
    style = {
      display: 'flex',
      opacity: 1,
      height: '100%',
      width: '100%',
    };
  } else {
    style = {
      display: 'none',
      opacity: 0,
      height: 0,
      width: 0,
    };
  }
  return (
    <div style={style} className="bulk-modal">
      <div className="bulk-modal__dialogue">
        <div className="dialogue__exit--container">
          <button
            data-parent="promotion-register"
            className="exit-btn"
            onClick={toggleModal}
          >
            <FontAwesome name="plus" />
          </button>
        </div>
        <div className="dialogue__product-title">
          <p>Yup!</p>
          <br />
          <p>
            <span className="required">BUY 4 BOTTLES</span>
            and we’ll slice
            <span className="required">25% OFF</span>
            the price.
          </p>
          <p>
            <i>Example:</i>
          </p>
        </div>
        <table className="dialogue__table">
          <thead className="table__header">
            <tr className="header__row">
              <td className="header--qty">QTY</td>
              <td className="header--description">Juice Description</td>
              <td className="header--price">Price</td>
            </tr>
          </thead>
          <tbody>
            <tr className="body__row">
              <td className="body--qty">4</td>
              <td className="body--description">
                <p className="description__title">Fruity Bamm-Bamm</p>
                <p className="description__nicotine-strength">
                  Nicotine Strenght: <i>6mg</i>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="dialogue__action-btns">
          <button
            data-parent="promotion-register"
            data-tag="view-juice"
            className="action-btn__continue sweep-right"
            onClick={toggleModal}
          >Close</button>

          <button
            data-parent="promotion-register"
            data-tag="view-checkout"
            className="action-btn__checkout sweep-right"
            onClick={toggleModal}
          >{'Let\'s Do It!'}</button>
        </div>
      </div>
    </div>
  );
}
const { bool, func } = React.PropTypes;
RegisterModal.propTypes = {
  showModal: bool.isRequired,
  toggleModal: func.isRequired,
};
export default RegisterModal;