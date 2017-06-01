/* eslint-disable no-lone-blocks, import/first*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import FontAwesome from 'react-fontawesome';
import _ from 'lodash';
import { propTypes, defaultProps } from './propTypes';

import orderActions from '../../../../../redux/orders/';
import userActions from '../../../../../redux/user/';
import {
  FindProductById,
  FindProductsByFlavor,
  AddToMemberCart,
  EditToMemberCart,
} from './graphql.imports';

import {
  MainTitle,
  BreadCrumb,
  ActionBtns,
  SuccessModal,
  BulkSaleModal,
  RegisterModal,
  ProductDisplay,
} from './component.imports';

class SingleProduct extends Component {
  static propTypes = propTypes
  static defaultProps = defaultProps
  constructor(props) {
    super(props);
    this.state = {
      qty: 0,
      error: false,
      added: false,
      product: null,
      errorMsg: '',
      showBulkModal: false,
      chosenStrength: 0,
      showSuccessModal: false,
      showRegisterModal: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps, this.props)) {
      const { loggedIn } = nextProps;
      this.setState(() => ({ loggedIn }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isArrayEqual = (np, tp) => _(np).differenceWith(tp, _.isEqual).isEmpty();

    const userCartDiff = isArrayEqual(nextProps.userCart, this.props.userCart);
    const guestCartDiff = isArrayEqual(nextProps.guestCart, this.props.guestCart);

    if (!_.isEqual(nextState, this.state) || !_.isEqual(nextProps, this.props) || userCartDiff || guestCartDiff) return true;
    return false;
  }

  modalHandler = (e) => {
    let parentEl = e.target.dataset.parent;
    let tagEl = e.target.dataset.tag;
    if (!parentEl) {
      parentEl = e.target.parentNode.dataset.parent;
    }
    if (!tagEl) {
      tagEl = e.target.parentNode.dataset.tag;
    }

    switch (parentEl) {
      case 'success': {
        switch (tagEl) {
          case 'view-cart':
            this.toggleModalAndGo('showSuccessModal', '/cart'); break;
          case 'view-checkout':
            this.toggleModalAndGo('showSuccessModal', '/express_checkout'); break;
          default: this.toggleModal('showSuccessModal');
        }
      } break;
      case 'promotion-bulk': {
        switch (tagEl) {
          case 'view-juices':
            this.toggleModalAndGo('showBulkModal', '/juices'); break;
          default: this.toggleModal('showBulkModal');
        }
      } break;
      case 'promotion-register': {
        switch (tagEl) {
          case 'view-signup':
            this.toggleModalAndGo('showRegisterModal', '/login'); break;
          default: this.toggleModal('showRegisterModal');
        }
      } break;
      default: this.toggleModal();
    }
  }

  toggleModal = (modal) => {
    this.setState(prevState => ({ [modal]: !prevState[modal] }));
  }

  toggleModalAndGo = (modal, location) => {
    this.setState(prevState => ({
      [modal]: !prevState[modal],
    }), () => this.props.push(location));
  }

  qtyHandler = (e) => {
    let buttonEl = e.target.dataset.tag;
    if (!buttonEl) {
      buttonEl = e.target.parentNode.dataset.tag;
    }

    if (buttonEl === 'qty-plus') {
      if (this.state.qty <= 3) {
        this.setState(prevState => ({
          ...prevState,
          error: false,
          errorMsg: '',
          qty: (prevState.qty += 1),
        }));
      } else {
        this.setState(prevState => ({
          ...prevState,
          error: true,
          errorMsg: 'Too much',
        }));
      }
    } else if (buttonEl === 'qty-minus') {
      const { qty } = this.state;
      if (qty >= 1 && qty <= 4) {
        this.setState(prevState => ({
          ...prevState,
          error: false,
          errorMsg: '',
          qty: (prevState.qty -= 1),
        }));
      } else {
        this.setState(prevState => ({
          ...prevState,
          error: true,
          errorMsg: 'Not enough',
        }));
      }
    }
  }

  nicotineHandler = (e) => {
    let nicEl = e.target.dataset.tag;
    if (!nicEl) {
      nicEl = e.target.parentNode.dataset.tag;
    }
    return this.setState(() => ({
      error: false,
      errorMsg: '',
      chosenStrength: Number(nicEl),
    }));
  }

  composeGlobalCartInfo = () => {
    const { loggedIn, guestCart, userCart } = this.props,
      { qty: requestQty, product: { _id: productId } } = this.state,
      prevCartIds = [];

    let updatedCart = [];
    if (loggedIn && userCart.length) {
      const updatedUserCart = userCart
      .map((productObj) => {
        if (Object.prototype.hasOwnProperty.call(productObj, 'product')
        && (productObj.product === productId)) {
          productObj.qty += requestQty;
          return productObj;
        }
        return productObj;
      });
      updatedCart = [...updatedUserCart];
    } else if (!loggedIn && guestCart.length) {
      const updatedGuestCart = guestCart
      .map((productObj) => {
        if (Object.prototype.hasOwnProperty.call(productObj, '_id')
        && productObj._id === productId) {
          productObj.qty += requestQty;
          return productObj;
        }
        return productObj;
      });
      updatedCart = [...updatedGuestCart];
    }

    const globalRequestQty = updatedCart
    .reduce((accum, nextObj) => {
      if (Object.prototype.hasOwnProperty.call(nextObj, '_id')) prevCartIds.push(nextObj._id);

      if (typeof nextObj.product === 'string') prevCartIds.push(nextObj.product);

      accum += nextObj.qty;
      return accum;
    }, 0);
    return {
      updatedCart,
      prevCartIds,
      globalRequestQty,
    };
  }

  addToCartHandler = () => {
    // 1. If the total items in the cart (redux store) are >= 4, then throw error.
    // 2. If the total items in the cart are <4 than, verify the additional qty, will not exceed 4.  If so, throw an error.
    // 3.  If the items to be added + the total <= 4, then reduce like items, and dispatch.
    if (this.state.qty === 0) {
      this.setState(() => ({
        error: true,
        errorMsg: 'You must choose a quantity of at least 1.',
      }));
    } else if (!this.state.chosenStrength) {
      this.setState(() => ({
        error: true,
        errorMsg: 'No strength',
      }));
    } else {
      const {
        updatedCart,
        prevCartIds,
        globalRequestQty,
      } = this.composeGlobalCartInfo(),

        {
          qty,
          chosenStrength: strength,
          product: { _id: productId },
        } = this.state,

        deltaQty = (globalRequestQty > 4) && (globalRequestQty - 4);

      if (globalRequestQty > 4) {
        this.setState({
          qty: 0,
          error: true,
          errorMsg: 'Max items',
          chosenStrength: 0,
        });
      } else if (deltaQty > 0) {
        this.setState(() => ({
          qty: 0,
          error: true,
          errorMsg: `You have too many items in your cart.  Please remove ${deltaQty} items from your cart to add the requested quantity.`,
        }));
      } else if (!deltaQty) {
        const {
          data,
          userId,
          loggedIn,
        } = this.props,

          currentProduct = {
            _id: productId,
            qty,
            userId,
            strength,
            ...data.FindProductById.product,
          };

        if (!prevCartIds.includes(productId) && updatedCart.length) {
          updatedCart.push(currentProduct);
        }

        if (loggedIn) {
          if (updatedCart.length) {
            this.setState(() => ({
              qty: 0,
              added: true,
              error: false,
              errorMsg: '',
              chosenStrength: 0,
            }), () => {
              this.props.EditToMemberCart({
                variables: {
                  userId,
                  products: updatedCart,
                },
              })
              .then(({ data: { EditToMemberCart: updatedUser } }) => {
                this.props.saveProfile(updatedUser);
              });
            });
          } else {
            this.setState(() => ({
              qty: 0,
              added: true,
              error: false,
              errorMsg: '',
              chosenStrength: 0,
            }), () => {
              this.props.AddToMemberCart({
                variables: {
                  qty,
                  userId,
                  strength,
                  product: productId,
                },
              })
              .then(({ data: { AddToMemberCart: updatedUser } }) => {
                this.props.saveProfile(updatedUser);
              });
            });
          }
        } else if (!loggedIn) {
          if (updatedCart.length) {
            this.setState(() => ({
              qty: 0,
              added: true,
              error: false,
              errorMsg: '',
              chosenStrength: 0,
            }), () => {
              this.props.updateToGuestCart(updatedCart);
            });
          } else {
            this.setState(() => ({
              qty: 0,
              added: true,
              error: false,
              errorMsg: '',
              chosenStrength: 0,
            }), () => {
              this.props.addToGuestCart(currentProduct);
            });
          }
        }
      }
    }
  }

  componentDidUpdate() {
    if (this.state.added) {
      setTimeout(() => {
        this.setState({ added: false });
      }, 5000);
    }
  }

  render() {
    const {
      qty,
      error,
      added,
      errorMsg,
      showBulkModal,
      chosenStrength,
      showSuccessModal,
      showRegisterModal,
    } = this.state;

    const {
      data,
      taxRate,
      loggedIn,
    } = this.props;
    console.log('%cdata', 'background:red;', data ? data.FindProductsByFlavor : 'empty');
    return (
      <div className="juice-page__main">
        <BreadCrumb
          paths={['Home', 'Juices']}
          classes={['home', 'home']}
          destination={['', 'juices']}
          lastCrumb={data.FindProductById ? data.FindProductById.product.title : 'Juice Page'}
        />
        {
          data.FindProductById ?
            <MainTitle
              vendor={data.FindProductById.product.vendor}
              mainTitle={data.FindProductById.product.mainTitle}
            /> : ''
        }
        {
          data.loading ?
          (<h1 className="main__loading">
            <FontAwesome name="spinner" pulse size="3x" />
            <br />
            Loading...
          </h1>) :
          <ProductDisplay
            qty={qty}
            added={added}
            error={error}
            errorMsg={errorMsg}
            loggedIn={loggedIn}
            qtyHandler={this.qtyHandler}
            chosenStrength={chosenStrength}
            modalHandler={this.modalHandler}
            nicotineHandler={this.nicotineHandler}
            addToCartHandler={this.addToCartHandler}
            productsArray={data.FindProductsByFlavor ? data.FindProductsByFlavor : null}
          />
        }
        <ActionBtns />

        <SuccessModal
          qty={qty}
          productTitle={data.FindProductById ? data.FindProductById.product.title : ''}
          showModal={showSuccessModal}
          modalHandler={this.modalHandler}
        />

        <BulkSaleModal
          taxRate={taxRate}
          showModal={showBulkModal}
          modalHandler={this.modalHandler}
        />

        <RegisterModal
          taxRate={taxRate}
          loggedIn={loggedIn}
          showModal={showRegisterModal}
          modalHandler={this.modalHandler}
        />
      </div>
    );
  }
}
const SingleProductWithState = connect(
  ({ orders, auth, routing, user }) => ({
    userId: user.profile ? user.profile._id : '',
    flavor: routing.locationBeforeTransitions.pathname.split('/')[1],
    taxRate: orders.taxRate.totalRate,
    loggedIn: auth.loggedIn || false,
    userCart: auth.loggedIn ? user.profile.shopping.cart : [],
    guestCart: orders.cart,
  }),
  dispatch => ({
    push: location => dispatch(push(location)),

    saveProfile: updatedUser => dispatch(userActions.saveProfile(updatedUser)),

    addToGuestCart: productObj =>
    dispatch(orderActions.addToGuestCart(productObj)),

    updateToGuestCart: updatedCartProducts =>
    dispatch(orderActions.updateToGuestCart(updatedCartProducts)),

    addToReduxProfileCart: cart => dispatch(userActions.addToReduxProfileCart(cart)),

    addToReduxMemberCart: products => dispatch(orderActions.addToReduxMemberCart(products)),

    updateToReduxMemberCart: products => dispatch(orderActions.updateToReduxMemberCart(products)),
  }),
)(SingleProduct);

const SingleProductWithStateAndData = compose(
  graphql(FindProductById, { skip: true }),
  graphql(FindProductsByFlavor, {
    options: ({ location }) => ({
      variables: {
        flavor: location.pathname.split('/')[2],
      },
    }),
  }),
  graphql(AddToMemberCart, { name: 'AddToMemberCart' }),
  graphql(EditToMemberCart, { name: 'EditToMemberCart' }),
)(SingleProductWithState);
export default SingleProductWithStateAndData;
