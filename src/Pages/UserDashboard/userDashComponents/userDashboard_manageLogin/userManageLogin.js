import React, { PropTypes } from 'react';
import 'react-router';
import Breadcrumb from '../../../../Components/breadcrumbs';
import UserSideBar from '../userDashboard_sidebar/userSideBar';
import UserWelcomeMsg from '../userDashboard_welcomeMsg/userWelcomeMsg';

const propTypes = {
  location: PropTypes.objectOf(PropTypes.any),
};

function UserManageLogin({ location }) {
  const homeDashboard = location.pathname.split('/')[1];
  return (
    <div className="manage-login--main">
      <div className="manage-login--container">
        <Breadcrumb
          paths={['Home', 'Your Account']}
          classes={['home', 'your-account']}
          destination={['', homeDashboard]}
          lastCrumb="Manage Login"
        />
        <UserWelcomeMsg />
        <div className="manage-login__body">
          <UserSideBar location={location} />
          <div className="body__dashboard">
            <div className="dashboard--container">
              <div className="manage-login__title">
                <h1>Manage Login</h1>
              </div>
              <div className="manage-login__body">
                <div className="manage-login__header">
                  <p> From this page, you can edit your Username, reset your Password, or add another  form of login to your account.  We suggest you have 2 forms of loggin in to your account.
                  </p>
                </div>

                <div className="manage-login__methods--container">
                  <div className="methods__title">
                    <h3>Login Methods</h3>
                  </div>

                  <div className="methods__email-password">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
UserManageLogin.propTypes = propTypes;
export default UserManageLogin;
