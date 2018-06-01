import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';
import onedataWebsocketClientTranslations from './onedata-gui-websocket-client';

import providers from './tabs/providers';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import groups from './tabs/groups';
import users from './tabs/users';

import loginBox from './components/login-box';
import contentTokens from './components/content-tokens';
import contentTokensEmpty from './components/content-tokens-empty';
import contentProviderRedirect from './components/content-provider-redirect';
import contentUsers from './components/content-users';
import sidebarSpaces from './components/sidebar-spaces';
import sidebarProviders from './components/sidebar-providers';
import sidebarGroups from './components/sidebar-groups';
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
import contentGroupsIndex from './components/content-groups-index';
import contentGroupsEmpty from './components/content-groups-empty';
import contentGroupsMembers from './components/content-groups-members';
import collectionPermissions from './components/collection-permissions';
import privilegesBatchEditModal from './components/privileges-batch-edit-modal';
import invitationTokenPresenter from './components/invitation-token-presenter';
import contentSpacesPrivileges from './components/content-spaces-privileges';

import spaceActions from './services/space-actions';
import groupActions from './services/group-actions';
import clientTokenActions from './services/client-token-actions';
import clientTokenManager from './services/client-token-manager';
import guiUtils from './services/gui-utils';

let translations = {
  tabs: {
    providers,
    tokens,
    spaces,
    groups,
    users,
  },
  components: {
    loginBox,
    contentTokens,
    contentTokensEmpty,
    contentProviderRedirect,
    contentUsers,
    sidebarSpaces,
    sidebarProviders,
    sidebarGroups,
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
    contentGroupsIndex,
    contentGroupsEmpty,
    contentGroupsMembers,
    collectionPermissions,
    privilegesBatchEditModal,
    invitationTokenPresenter,
    contentSpacesPrivileges,
  },
  services: {
    clientTokenActions,
    clientTokenManager,
    spaceActions,
    groupActions,
    guiUtils,
  },
};

export default _.merge({},
  onedataCommonTranslations,
  onedataWebsocketClientTranslations,
  translations
);
