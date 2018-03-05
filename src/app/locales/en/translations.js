import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';
import onedataWebsocketClientTranslations from './onedata-gui-websocket-client';

import providers from './tabs/providers';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import users from './tabs/users';

import loginBox from './components/login-box';
import brandInfo from './components/brand-info';
import contentTokens from './components/content-tokens';
import contentTokensEmpty from './components/content-tokens-empty';
import contentProviderRedirect from './components/content-provider-redirect';
import contentUsers from './components/content-users';
import sidebarSpaces from './components/sidebar-spaces';
import sidebarProviders from './components/sidebar-providers';
import contentSpacesEmpty from './components/content-spaces-empty';
import contentSpacesIndex from './components/content-spaces-index';
import contentSpacesNew from './components/content-spaces-new';
import contentSpacesJoin from './components/content-spaces-join';
import contentSpacesSupport from './components/content-spaces-support';
import contentSpacesProviders from './components/content-spaces-providers';
import contentProviderEmpty from './components/content-provider-empty';
import leaveSpaceConfirm from './components/leave-space-confirm';
import contentGroupsJoin from './components/content-groups-join';
import contentGroupsNew from './components/content-groups-new';

import spaceActions from './services/space-actions';
import groupActions from './services/group-actions';
import clientTokenActions from './services/client-token-actions';

let translations = {
  tabs: {
    providers,
    tokens,
    spaces,
    users,
  },
  components: {
    loginBox,
    brandInfo,
    contentTokens,
    contentTokensEmpty,
    contentProviderRedirect,
    contentUsers,
    sidebarSpaces,
    sidebarProviders,
    contentSpacesEmpty,
    contentSpacesIndex,
    contentSpacesNew,
    contentProviderEmpty,
    contentSpacesJoin,
    contentSpacesSupport,
    contentSpacesProviders,
    leaveSpaceConfirm,
    contentGroupsJoin,
    contentGroupsNew,
  },
  services: {
    clientTokenActions,
    spaceActions,
    groupActions,
  },
};

export default _.merge({},
  onedataCommonTranslations,
  onedataWebsocketClientTranslations,
  translations
);
