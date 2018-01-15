import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';
import contentProviderRedirect from './components/content-provider-redirect';
import contentUsers from './components/content-users';

let translations = {
  components: {
    loginBox,
    brandInfo,
    contentProviderRedirect,
    contentUsers,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
