import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';
import contentTokens from './components/content-tokens';
import contentTokensEmpty from './components/content-tokens-empty';
import contentProviderRedirect from './components/content-provider-redirect';
import contentUsers from './components/content-users';

import sidebarResources from './services/sidebar-resources';
import clientTokenActions from './services/client-token-actions';

let translations = {
  components: {
    loginBox,
    brandInfo,
    contentTokens,
    contentTokensEmpty,
    contentProviderRedirect,
    contentUsers,
  },
  services: {
    sidebarResources,
    clientTokenActions,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
