import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';
import contentProviderRedirect from './components/content-provider-redirect';

let translations = {
  components: {
    loginBox,
    brandInfo,
    contentProviderRedirect,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
