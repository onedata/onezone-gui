import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';
import onedataWebsocketClientTranslations from './onedata-gui-websocket-client';

import data from './tabs/data';
import clusters from './tabs/clusters';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import groups from './tabs/groups';
import harvesters from './tabs/harvesters';
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
import contentGroupsMembers from './components/content-groups-members';
import contentGroupsHierarchy from './components/content-groups-hierarchy';
import contentGroupsJoinAsSubgroup from './components/content-groups-join-as-subgroup';
import contentGroupsJoinSpace from './components/content-groups-join-space';
import contentClustersAdd from './components/content-clusters-add';
import contentClustersEmpty from './components/content-clusters-empty';
import contentClustersIndex from './components/content-clusters-index';
import membersCollection from './components/members-collection';
import privilegesEditorModal from './components/privileges-editor-modal';
import contentSpacesMembers from './components/content-spaces-members';
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
import resourceInfoTile from './components/resource-info-tile';
import resourceMembersTile from './components/resource-members-tile';
import resourceMembershipTile from './components/resource-membership-tile';
import sidebarHarvesters from './components/sidebar-harvesters';

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
    clusters,
    harvesters,
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
    contentGroupsMembers,
    contentGroupsHierarchy,
    contentGroupsJoinAsSubgroup,
    contentGroupsJoinSpace,
    contentClustersAdd,
    contentClustersEmpty,
    contentClustersIndex,
    membersCollection,
    privilegesEditorModal,
    contentSpacesMembers,
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
    resourceInfoTile,
    resourceMembersTile,
    resourceMembershipTile,
    sidebarHarvesters,
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
