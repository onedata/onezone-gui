import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';
import contentTokens from './components/content-tokens';

import sidebarResources from './services/sidebar-resources';

let translations = {
  components: {
    loginBox,
    brandInfo,
    contentTokens,
  },
  services: {
    sidebarResources,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
