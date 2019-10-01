import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';
import onedataWebsocketClientTranslations from './onedata-gui-websocket-client';

import providers from './tabs/providers';
import clusters from './tabs/clusters';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import groups from './tabs/groups';
import harvesters from './tabs/harvesters';
import users from './tabs/users';

import cannotInitWebsocket from './errors/cannot-init-websocket';
import backendErrors from './errors/backend-errors';

import loginBox from './components/login-box';
import contentTokens from './components/content-tokens';
import contentTokensEmpty from './components/content-tokens-empty';
import contentProviderRedirect from './components/content-provider-redirect';
import contentClustersEndpointError from './components/content-clusters-endpoint-error';
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
import contentSpacesJoinHarvester from './components/content-spaces-join-harvester';
import contentProviderEmpty from './components/content-provider-empty';
import leaveSpaceConfirm from './components/leave-space-confirm';
import contentGroupsJoin from './components/content-groups-join';
import contentGroupsNew from './components/content-groups-new';
import contentGroupsEmpty from './components/content-groups-empty';
import contentGroupsMembers from './components/content-groups-members';
import contentGroupsHierarchy from './components/content-groups-hierarchy';
import contentGroupsJoinAsSubgroup from './components/content-groups-join-as-subgroup';
import contentGroupsJoinSpace from './components/content-groups-join-space';
import contentGroupsJoinHarvester from './components/content-groups-join-harvester';
import contentGroupsJoinCluster from './components/content-groups-join-cluster';
import contentClustersAdd from './components/content-clusters-add';
import contentClustersEmpty from './components/content-clusters-empty';
import contentClustersAuthenticationError from './components/content-clusters-authentication-error';
import contentClustersDeregister from './components/content-clusters-deregister';
import contentClustersMembers from './components/content-clusters-members';
import contentClustersJoin from './components/content-clusters-join';
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
import contentHarvestersNew from './components/content-harvesters-new';
import contentHarvestersJoin from './components/content-harvesters-join';
import contentHarvestersConfig from './components/content-harvesters-config';
import contentHarvestersSpaces from './components/content-harvesters-spaces';
import contentHarvestersIndices from './components/content-harvesters-indices';
import contentHarvestersMembers from './components/content-harvesters-members';
import contentHarvestersEmpty from './components/content-harvesters-empty';
import contentHarvestersPlugin from './components/content-harvesters-plugin';
import addYourSpaceModal from './components/add-your-space-modal';
import harvesterRemoveModal from './components/harvester-remove-modal';
import harvesterConfiguration from './components/harvester-configuration';
import websocketReconnectionModal from './components/websocket-reconnection-modal';
import fatalConnectionErrorModal from './components/fatal-connection-error-modal';
import cookiesConsent from './components/cookies-consent';
import privacyPolicyModal from './components/privacy-policy-modal';

import oneproviderAuthenticationError from './components/alerts/oneprovider-authentication-error';

import spaceActions from './services/space-actions';
import groupActions from './services/group-actions';
import clusterActions from './services/cluster-actions';
import privilegeActions from './services/privilege-actions';
import clientTokenActions from './services/client-token-actions';
import clientTokenManager from './services/client-token-manager';
import harvesterActions from './services/harvester-actions';
import userActions from './services/user-actions';
import guiUtils from './services/gui-utils';

let translations = {
  tabs: {
    providers,
    tokens,
    spaces,
    groups,
    users,
    clusters,
    harvesters,
  },
  errors: {
    cannotInitWebsocket,
    backendErrors,
  },
  components: {
    alerts: {
      oneproviderAuthenticationError,
    },
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
    contentSpacesJoinHarvester,
    leaveSpaceConfirm,
    contentGroupsJoin,
    contentGroupsNew,
    contentGroupsEmpty,
    contentGroupsMembers,
    contentGroupsHierarchy,
    contentGroupsJoinAsSubgroup,
    contentGroupsJoinSpace,
    contentGroupsJoinHarvester,
    contentGroupsJoinCluster,
    contentClustersAdd,
    contentClustersEmpty,
    contentClustersAuthenticationError,
    contentClustersEndpointError,
    contentClustersDeregister,
    contentClustersMembers,
    contentClustersJoin,
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
    contentHarvestersNew,
    contentHarvestersJoin,
    contentHarvestersConfig,
    contentHarvestersSpaces,
    contentHarvestersIndices,
    contentHarvestersMembers,
    contentHarvestersEmpty,
    contentHarvestersPlugin,
    addYourSpaceModal,
    harvesterRemoveModal,
    harvesterConfiguration,
    websocketReconnectionModal,
    fatalConnectionErrorModal,
    cookiesConsent,
    privacyPolicyModal,
  },
  services: {
    clientTokenActions,
    clientTokenManager,
    spaceActions,
    groupActions,
    clusterActions,
    privilegeActions,
    harvesterActions,
    userActions,
    guiUtils,
  },
};

export default _.merge({},
  onedataCommonTranslations,
  onedataWebsocketClientTranslations,
  translations
);
