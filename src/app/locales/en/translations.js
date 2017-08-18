import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import loginBox from './components/login-box';

let translations = {
  components: {
    loginBox,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
