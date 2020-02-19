import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import providers from './tabs/providers';
import clusters from './tabs/clusters';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import shares from './tabs/shares';
import groups from './tabs/groups';
import harvesters from './tabs/harvesters';
import uploads from './tabs/uploads';
import users from './tabs/users';

import backendErrors from './errors/backend-errors';

import loginBox from './components/login-box';
import contentTokens from './components/content-tokens';
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
import contentSpacesNoSupport from './components/content-spaces-no-support';
import contentSpacesSupport from './components/content-spaces-support';
import contentSpacesProviders from './components/content-spaces-providers';
import contentSpacesData from './components/content-spaces-data';
import contentSpacesShares from './components/content-spaces-shares';
import contentSpacesTransfers from './components/content-spaces-transfers';
import oneproviderViewContainer from './components/oneprovider-view-container';
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
import contentSharesIndex from './components/content-shares-index';
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
import uploadPresenter from './components/upload-presenter';
import cookiesConsent from './components/cookies-consent';
import privacyPolicyModal from './components/privacy-policy-modal';
import sidebarTokens from './components/sidebar-tokens';
import removeTokenModal from './components/remove-token-modal';
import contentTokensNew from './components/content-tokens-new';
import tokenEditor from './components/token-editor';
import ceaseOneproviderSupportModal from './components/cease-oneprovider-support-modal';

import oneproviderAuthenticationError from './components/alerts/oneprovider-authentication-error';

import cleanObsoleteTokensModal from './components/modals/clean-obsolete-tokens-modal';

import spaceActions from './services/space-actions';
import groupActions from './services/group-actions';
import clusterActions from './services/cluster-actions';
import privilegeActions from './services/privilege-actions';
import tokenActions from './services/token-actions';
import harvesterActions from './services/harvester-actions';
import userActions from './services/user-actions';
import guiUtils from './services/gui-utils';
import uploadManager from './services/upload-manager';

import uploadObject from './utils/upload-object';

let translations = {
  tabs: {
    undefined: {
      menuItem: '',
    },
    providers,
    tokens,
    spaces,
    shares,
    groups,
    users,
    clusters,
    harvesters,
    uploads,
  },
  errors: {
    backendErrors,
  },
  components: {
    alerts: {
      oneproviderAuthenticationError,
    },
    modals: {
      cleanObsoleteTokensModal,
    },
    loginBox,
    contentTokens,
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
    contentSpacesNoSupport,
    contentSpacesSupport,
    contentSpacesProviders,
    contentSpacesData,
    contentSpacesShares,
    contentSpacesTransfers,
    oneproviderViewContainer,
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
    contentSharesIndex,
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
    uploadPresenter,
    cookiesConsent,
    privacyPolicyModal,
    sidebarTokens,
    removeTokenModal,
    contentTokensNew,
    tokenEditor,
    ceaseOneproviderSupportModal,
  },
  services: {
    tokenActions,
    spaceActions,
    groupActions,
    clusterActions,
    privilegeActions,
    harvesterActions,
    userActions,
    guiUtils,
    uploadManager,
  },
  utils: {
    uploadObject,
  },
};

export default _.merge({},
  onedataCommonTranslations,
  translations
);
