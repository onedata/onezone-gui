import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';

let translations = {
  components: {
    loginBox,
    brandInfo,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
