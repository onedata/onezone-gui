import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';
import onedataWebsocketClientTranslations from './onedata-gui-websocket-client';

import data from './tabs/data';
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
import sidebarData from './components/sidebar-data';
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
import contentGroupsEmpty from './components/content-groups-empty';
import contentGroupsIndex from './components/content-groups-index';
import contentGroupsMembers from './components/content-groups-members';
import contentGroupsMembership from './components/content-groups-membership';
import contentGroupsHierarchy from './components/content-groups-hierarchy';
import contentGroupsJoinAsSubgroup from './components/content-groups-join-as-subgroup';
import contentGroupsJoinSpace from './components/content-groups-join-space';
import collectionPermissions from './components/collection-permissions';
import privilegesEditorModal from './components/privileges-editor-modal';
import contentSpacesMembers from './components/content-spaces-members';
import contentSpacesMembership from './components/content-spaces-membership';
import groupsHierarchyVisualiser from './components/groups-hierarchy-visualiser';
import leaveModal from './components/leave-modal';
import groupRemoveModal from './components/group-remove-modal';
import removeRelationModal from './components/remove-relation-modal';
import groupCreateRelativeModal from './components/group-create-relative-modal';
import groupAddYourGroupModal from './components/group-add-your-group-modal';
import groupJoinUsingTokenModal from './components/group-join-using-token-modal';
import inviteUsingTokenModal from './components/invite-using-token-modal';
import joinAsUserModal from './components/join-as-user-modal';
import membershipVisualiser from './components/membership-visualiser';

import spaceActions from './services/space-actions';
import groupActions from './services/group-actions';
import privilegeActions from './services/privilege-actions';
import clientTokenActions from './services/client-token-actions';
import clientTokenManager from './services/client-token-manager';
import guiUtils from './services/gui-utils';

let translations = {
  tabs: {
    data,
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
    sidebarData,
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
    contentGroupsEmpty,
    contentGroupsIndex,
    contentGroupsMembers,
    contentGroupsMembership,
    contentGroupsHierarchy,
    contentGroupsJoinAsSubgroup,
    contentGroupsJoinSpace,
    collectionPermissions,
    privilegesEditorModal,
    contentSpacesMembers,
    contentSpacesMembership,
    groupsHierarchyVisualiser,
    leaveModal,
    groupRemoveModal,
    removeRelationModal,
    groupCreateRelativeModal,
    groupAddYourGroupModal,
    groupJoinUsingTokenModal,
    inviteUsingTokenModal,
    joinAsUserModal,
    membershipVisualiser,
  },
  services: {
    clientTokenActions,
    clientTokenManager,
    spaceActions,
    groupActions,
    privilegeActions,
    guiUtils,
  },
};

export default _.merge({},
  onedataCommonTranslations,
  onedataWebsocketClientTranslations,
  translations
);
