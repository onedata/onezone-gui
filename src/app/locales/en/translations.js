import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import providers from './tabs/providers';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';
import contentTokens from './components/content-tokens';
import contentTokensEmpty from './components/content-tokens-empty';
import contentProviderRedirect from './components/content-provider-redirect';
import contentUsers from './components/content-users';
import sidebarSpaces from './components/sidebar-spaces';
import contentSpacesEmpty from './components/content-spaces-empty';
import contentSpacesIndex from './components/content-spaces-index';
import contentSpacesNew from './components/content-spaces-new';
import contentSpacesJoin from './components/content-spaces-join';
import contentSpacesSupport from './components/content-spaces-support';
import contentProviderEmpty from './components/content-provider-empty';
import leaveSpaceConfirm from './components/leave-space-confirm';

import spaceActions from './services/space-actions';
import sidebarResources from './services/sidebar-resources';
import clientTokenActions from './services/client-token-actions';

let translations = {
  tabs: {
    providers,
    tokens,
    spaces,
  },
  components: {
    loginBox,
    brandInfo,
    contentTokens,
    contentTokensEmpty,
    contentProviderRedirect,
    contentUsers,
    sidebarSpaces,
    contentSpacesEmpty,
    contentSpacesIndex,
    contentSpacesNew,
    contentProviderEmpty,
    contentSpacesJoin,
    contentSpacesSupport,
    leaveSpaceConfirm,
  },
  services: {
    sidebarResources,
    clientTokenActions,
    spaceActions,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
