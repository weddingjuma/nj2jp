import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage as IntlMsg } from 'react-intl';
import { WebflowJs } from './assets/utils';

const MemberCardBlurb = (props) => {
  WebflowJs(); //eslint-disable-line

  return (
    <p className="about-container__staff staff--bio-text">
      <IntlMsg id={props.blurb} />
    </p>
  );
};
MemberCardBlurb.propTypes = {
  blurb: PropTypes.string.isRequired,
};

export default MemberCardBlurb;