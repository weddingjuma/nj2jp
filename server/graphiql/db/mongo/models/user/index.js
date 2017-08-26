/* eslint-disable no-use-before-define, no-console */
import { Promise as bbPromise } from 'bluebird';
import userSchema from '../schemas/userSchema';
import Product from './product';
import db from '../connection';

/**
* Function: "fetchUserProfile"
* 1) Query User collection using input argument "userId".
* 2) Resolves || Rejects with result.
*
* @param {string} userId - the user's Mongo _id.
*
* @return {object} - Promise resolved with found User document.
*/
userSchema.statics.fetchUserProfile = userId =>
new Promise((resolve, reject) => {
  User
  .findById(userId)
  .exec()
  .then((dbUser) => {
    console.log(`User Found: ${dbUser._id}. Sending updated profile to Client.  `);
    resolve(dbUser);
  })
  .catch((error) => {
    console.log(`Could Not find a user with this is: ${userId}. Mongo ERROR: ${error}`);
    reject(`Could Not find a user with this is: ${userId}. Mongo ERROR: ${error}`);
  });
});
/**
* Function: "loginOrRegister"
* Checks for previous user matching the input auth0 id.  If found, logs user in. If not found, registers user.
*
* 1) Saves "auth0Id" & "loginType" to external variables and removes those from input "args" arguments.  By removing from args input, register user can cleanly create new instance with 1 input, "args".
* 2) Queries User Collection with "auth0Id".
* 3a) If found - calls "loginUser" with loginType, found user & remaining args.
* 3b) If not found - calls "registerUser" with input args.
* 4) Resolves || Rejects with final result.
*
* @param {string} userId - the user's Mongo _id.
*
* @return {object} - Promise resolved with updated User document.
*/
userSchema.statics.loginOrRegister = args =>
new Promise((resolve, reject) => {
  console.log('\n\nUser.loginOrRegister\n');

  const auth0Id = args.auth0Id;
  const loginType = args.loginType;
  delete args.auth0Id;
  delete args.loginType;

  User
  .findOne({ 'authentication.auth0Identities.user_id': auth0Id })
  .exec()
  .then((dbUser) => {
    if (!dbUser) return User.registerUser(args);
    return User.loginUser(loginType, dbUser, args);
  })
  .then(resolve)
  .catch(error => reject({ problem: error }));
});

/**
* 1) Modifies dbUser document values based on new successful login and saves result.
* 2) Resolves || Rejects with result.
*
* @param {string} loginType - the Social Auth provider used to login.
* @param {object} dbUser - the Mongo User Document to modify.
* @param {object} userObj - the new values to update Mongo User Document.
*
* @return {object} - Promise resolved with updates User Document.
*/
userSchema.statics.loginUser = (loginType, dbUser, userObj) =>
new Promise((resolve, reject) => {
  console.log('Found Existing User.\n');

  let userDoc = {};

  dbUser.authentication.totalLogins += 1;
  dbUser.authentication.logins.push(userObj.authenticationLogins.pop());
  dbUser.contactInfo.location = { ...userObj.contactInfoLocation };
  dbUser.socialProfileBlob[loginType] = userObj.socialProfileBlob[loginType];

  const oldProducts = [...dbUser.shopping.cart];
  const newProducts = [...userObj.shoppingCart];
  const newCart = [...oldProducts, ...newProducts];
  let updateNewProducts = false;

  if (!!newCart.length) {
    const newQty = newCart.reduce((accum, next) => (accum += next.qty), 0);

    if (newQty > 4) {
      dbUser.error = {
        hard: false,
        soft: true,
        message: 'You have old items still saved in your cart from your last login.  Please purchase or delete these items before adding new ones.  Thanks for visiting us again. 🙂',
      };
    } else {
      updateNewProducts = true;
      dbUser.shopping.cart = [...newCart];
    }
  }
  dbUser.save({ validateBeforeSave: true })
  .then((updatedUser) => {  //eslint-disable-line
    if (!updatedUser) {
      console.log('FAILED: Login User and Save.');

      resolve({
        error: {
          hard: true,
          soft: false,
          message: 'Unable to login at this time.',
        },
      });
    } else {
      console.log('SUCCEEDED: Login User and Save.');
      userDoc = updatedUser;

      const promiseArray = [];

      if (!updateNewProducts) {
        resolve(userDoc);
      } else {
        newProducts.forEach(({ productId }) => {
          promiseArray.push(
            Product.findByIdAndUpdate(productId, {
              $inc: {
                'product.quantities.inCarts': 1,
                'product.quantities.available': -1,
                'product.statistics.addsToCart': 1,
              },
            }, { new: true }).exec(),
          );
        });
        return Promise.all([...promiseArray]);
      }
    }
  })
  .then((results) => {
    console.log('SUCCEEDED: Update stats of new Products in Users cart: \n', results);
    resolve(userDoc);
  })
  .catch((error) => {
    console.log('FAILED: Login User.', error);
    reject(new Error('FAILED: Login User'));
  });
});

/**
* 1) Creates new Mongo User Document.
* 2) Resolves || Rejects with result.
*
* @param {object} userObj - New user info.
*
* @return {object} - Promise resolved with new User Document.
*/
userSchema.statics.registerUser = userObj =>
new Promise((resolve, reject) => {
  console.log('\n\nUser.registerUser');

  let userDoc = {};

  const {
    name,
    pictures,
    authentication,
    authenticationLogins,
    authenticationAuth0Identities,
    contactInfo,
    contactInfoLocation,
    contactInfoDevices,
    contactInfoSocialNetworks,
    shopping,
    shoppingCart,
    permissions,
    userStory,
    socialProfileBlob,
  } = userObj;

  bbPromise.fromCallback(cb => User.create({
    name,
    pictures,
    authentication: {
      ...authentication,
      logins: [...authenticationLogins],
      auth0Identities: [...authenticationAuth0Identities],
    },
    contactInfo: {
      ...contactInfo,
      email: contactInfo.email ? contactInfo.email : '',
      location: { ...contactInfoLocation },
      devices: [...contactInfoDevices],
      socialNetworks: [...contactInfoSocialNetworks],
    },
    shopping: {
      ...shopping,
      cart: [...shoppingCart],
    },
    permissions,
    userStory,
    socialProfileBlob,
  }, cb))
  .then((newUser) => {
    console.log('\nNew User created!: ', newUser._id, '\nName: ', newUser.name.display, '\n');

    userDoc = newUser;

    const promiseArray = [];
    shoppingCart.forEach(({ productId }) => {
      promiseArray.push(
        Product.findByIdAndUpdate(productId, {
          $inc: {
            'product.quantities.inCarts': 1,
            'product.quantities.available': -1,
            'product.statistics.addsToCart': 1,
          },
        }, { new: true }).exec(),
      );
    });
    return Promise.all([...promiseArray]);
  })
  .then((results) => {
    console.log('SUCCEEDED: Updated Product in the users cart: ', results);
    resolve(userDoc);
  })
  .catch(reject);
});

/**
* Updates User Document's shopping cart with product information.
* 1) Finds user by Mongo _id.
* 2) Populates found document's shopping cart with product info.
* 3) Saves changes.
* 4) Resolves || Rejects with result.
*
* @param {object} cartObj - userId {string}, qty {number}, product {object}.
*
* @return {object} - Promise resolved with updated User Document.
*/
userSchema.statics.addToMemberCart = ({ userId, qty, product }) =>
new Promise((resolve, reject) => {
  User.findById(userId)
  .exec()
  .then((dbUser) => {
    dbUser.shopping.cart.push({ qty, product });
    /* eslint-disable no-dupe-keys */
    return Promise.all([
      dbUser.save({ validateBeforeSave: true }),
      Product.findByIdAndUpdate(product, {
        $inc: {
          'product.quantities.inCarts': 1,
          'product.quantities.available': -1,
          'product.statistics.addsToCart': 1,
        },
      }, { new: true }),
    ]);
    /* eslint-enable no-dupe-keys */
  })
  .then((results) => {
    console.log('Success! 1) Saved product ID & QTY to the User\'s Shopping Cart!, 2) Update Product "quantities" & "statistics": ', results);
    resolve(results[0]);
  })
  .catch((error) => {
    console.log({
      problem: `Could not save to the Users shopping cart.
      args: {
        userId: ${userId},
        qty: ${qty},
        product: ${product},
      }
      Mongo Error: ${error}`,
    });
    reject({
      problem: `Could not save to the Users shopping cart.
      args: {
        userId: ${userId},
        qty: ${qty},
        product: ${product},
      }
      Mongo Error: ${error}`,
    });
  });
});
/**
* Deletes product from users shopping cart.
* 1) Finds user by Mongo _id.
* 2) filters users shopping cart by productId.
* 3) Saves changes.
* 4) Resolves || Rejects with result.
*
* @param {object} cartObj - userId {string}, productId {string}.
*
* @return {object} - Promise resolved with updated User Document.
*/
userSchema.statics.deleteFromCart = ({ userId, productId }) =>
new Promise((resolve, reject) => {
  console.log('\n\nUser.deleteFromCart\n');

  User.findById(userId)
  .exec()
  .then((dbUser) => {
    dbUser.shopping.cart = dbUser.shopping.cart.filter(cartObj => String(cartObj.product) !== String(productId));

    return Promise.all([
      dbUser.save({ validateBeforeSave: true }),
      Product.findByIdAndUpdate(productId, {
        $inc: {
          'product.quantities.inCarts': -1,
          'product.quantities.available': 1,
        },
      }, { new: true }).exec(),
    ]);
  })
  .then((savedUser) => {
    console.log(`
      Deleted Product: ${productId} from User: ${savedUser._id}.
    `);
    resolve(savedUser);
  })
  .catch((error) => {
    console.log(`Could not Delete Product: ${productId} from User: ${userId}. ERROR = ${error}`);
    reject(`Could not Delete Product: ${productId} from User: ${userId}. ERROR = ${error}`);
  });
});

/**
* Function: "emptyCart"
* 1) find User by "userId".
* 2) Once found, assign their shopping cart to an empty array.
* 3) Save changes.
* 4) Return the modified user document.
*
* @param {string} userid - Mongo User _id.
*
* @return {object} userDocument - Promise resolved with updates to User Document.
*/
userSchema.statics.emptyCart = ({ userId }) =>
new Promise((resolve, reject) => {
  console.log('\n\nUser.emptyCart\n');

  User.findById(userId)
  .exec()
  .then((dbUser) => {
    const promiseArray = [];
    dbUser.shopping.cart.forEach(({ productId }) => {
      promiseArray.push(
        Product.findByIdAndUpdate(productId, {
          $inc: {
            'product.quantities.inCarts': -1,
            'product.quantities.available': 1,
          },
        }, { new: true }).exec(),
      );
    });
    dbUser.shopping.cart = [];

    return Promise.all([
      dbUser.save({ validateBeforeSave: true }),
      ...promiseArray,
    ]);
  })
  .then((results) => {
    console.log(`SUCCEEDED: 1) Empty User Cart: "${results[0]._id}". 2) Update statistics for products remove from User Cart.`);
    resolve(results[0]);
  })
  .catch((error => reject(`Failed to empty cart for user: "${userId}".  Error = ${error}`)));
});
/**
* Modifies product(s) in user's shopping cart.
* 1) Finds user by Mongo _id.
* 2) Replaces shopping cart with new products array.
* 3) Saves changes.
* 4) Resolves || Rejects with result.
*
* @param {object} cartObj - userId {string}, products {array}.
*
* @return {object} - Promise resolved with updates User Document.
*/
userSchema.statics.editToMemberCart = ({ userId, products }) =>
new Promise((resolve, reject) => {
  console.log('\n\n@User.editToMemberCart\n');

  User
  .findById(userId)
  .exec()
  .then((dbUser) => {
    const promiseArray = [];
    [...products, ...dbUser.shopping.cart]
    .map(({ productId }) => productId)
    .map((productId, i, array) => {
      if (array.slice(i).includes(productId)) return productId;
      return '';
    })
    .forEach((productId) => {
      promiseArray.push(
        Product.findByIdAndUpdate(productId, {
          $inc: {
            'product.quantities.inCarts': -1,
            'product.quantities.available': 1,
          },
        }, { new: true }).exec());
    });

    dbUser.shopping.cart = products;
    return Promise.all([
      dbUser.save({ validateBeforeSave: true }),
      ...promiseArray,
    ]);
  })
  .then((results) => {
    console.log('SUCCEEDED: Updated user shopping cart!: ', results[0].shopping.cart);
    resolve(results[0]);
  })
  .catch((error) => {
    console.log(`Could not Update User: ${userId}. ERROR = ${error}`);
    reject(`Could not Update User: ${userId}. ERROR = ${error}`);
  });
});

userSchema.statics.editMemberProfile = ({ userId, userObj }) =>
new Promise((resolve, reject) => {
  console.log('\n\nUser.editMemberProfile\n');

  User.findByIdAndUpdate(userId, { $set: { ...userObj } }, { new: true })
  .exec()
  .then((updatedUser) => {
    console.log(`Updated User!: ${updatedUser._id}.`);
    resolve(updatedUser);
  })
  .catch((error) => {
    console.log(`Error while tring to update User _id "${userId}": ${error}.`);
    reject(`Error while tring to update User _id "${userId}": ${error}.`);
  });
});

const User = db.model('User', userSchema);
export default User;