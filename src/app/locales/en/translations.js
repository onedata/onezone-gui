import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

import providers from './tabs/providers';
import clusters from './tabs/clusters';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import shares from './tabs/shares';
import groups from './tabs/groups';
import harvesters from './tabs/harvesters';
import atmInventories from './tabs/atm-inventories';
import uploads from './tabs/uploads';
import users from './tabs/users';

import loginBox from './components/login-box';
import contentTokens from './components/content-tokens';
import contentProviderRedirect from './components/content-provider-redirect';
import contentClustersEndpointError from './components/content-clusters-endpoint-error';
import contentUsers from './components/content-users';
import sidebarSpaces from './components/sidebar-spaces';
import sidebarShares from './components/sidebar-shares';
import sidebarProviders from './components/sidebar-providers';
import sidebarGroups from './components/sidebar-groups';
import contentSpacesEmpty from './components/content-spaces-empty';
import contentSpacesIndex from './components/content-spaces-index';
import contentSpacesConfiguration from './components/content-spaces-configuration';
import contentSpacesNew from './components/content-spaces-new';
import contentSpacesNoSupport from './components/content-spaces-no-support';
import contentSpacesSupport from './components/content-spaces-support';
import contentSpacesProviders from './components/content-spaces-providers';
import contentSpacesMarketplace from './components/content-spaces-marketplace';
import spacesProvidersOverview from './components/spaces-providers-overview';
import contentSpacesData from './components/content-spaces-data';
import contentSpacesDatasets from './components/content-spaces-datasets';
import contentSpacesShares from './components/content-spaces-shares';
import contentSpacesTransfers from './components/content-spaces-transfers';
import contentSpacesHarvesters from './components/content-spaces-harvesters';
import contentSpacesAutomation from './components/content-spaces-automation';
import oneproviderViewContainer from './components/oneprovider-view-container';
import contentProviderEmpty from './components/content-provider-empty';
import contentGroupsNew from './components/content-groups-new';
import contentGroupsEmpty from './components/content-groups-empty';
import contentGroupsMembers from './components/content-groups-members';
import contentGroupsHierarchy from './components/content-groups-hierarchy';
import contentClustersAdd from './components/content-clusters-add';
import contentClustersEmpty from './components/content-clusters-empty';
import contentClustersAuthenticationError from './components/content-clusters-authentication-error';
import contentClustersDeregister from './components/content-clusters-deregister';
import contentClustersMembers from './components/content-clusters-members';
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
import joinAsUserModal from './components/join-as-user-modal';
import membershipVisualiser from './components/membership-visualiser';
import resourceInfoTile from './components/resource-info-tile';
import resourceMembersTile from './components/resource-members-tile';
import resourceMembershipTile from './components/resource-membership-tile';
import sidebarHarvesters from './components/sidebar-harvesters';
import contentHarvestersNew from './components/content-harvesters-new';
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
import contentPrivacyPolicy from './components/content-privacy-policy';
import contentTermsOfUse from './components/content-terms-of-use';
import publicPage from './components/public-page';
import sidebarTokens from './components/sidebar-tokens';
import removeTokenModal from './components/remove-token-modal';
import contentTokensNew from './components/content-tokens-new';
import tokenEditor from './components/token-editor';
import inviteTokenGenerator from './components/invite-token-generator';
import tokenConsumer from './components/token-consumer';
import contentTokensConsumer from './components/content-tokens-consumer';
import tokenTemplateSelector from './components/token-template-selector';
import sidebarAtmInventories from './components/sidebar-atm-inventories';
import contentAtmInventoriesEmpty from './components/content-atm-inventories-empty';
import contentAtmInventoriesNew from './components/content-atm-inventories-new';
import contentAtmInventoriesMembers from './components/content-atm-inventories-members';
import contentAtmInventoriesLambdas from './components/content-atm-inventories-lambdas';
import contentAtmInventoriesWorkflows from './components/content-atm-inventories-workflows';
import emptyCollectionSidebar from './components/empty-collection-sidebar';
import providerTabLi from './components/provider-tab-li';
import apiSamples from './components/api-samples';
import spaceConfiguration from './components/space-configuration';
import joinImage from './components/join-image';

import oneproviderAuthenticationError from './components/alerts/oneprovider-authentication-error';
import cleanObsoleteTokensModal from './components/modals/clean-obsolete-tokens-modal';
import generateInviteTokenModal from './components/modals/generate-invite-token-modal';
import unlinkAtmLambdaModal from './components/modals/unlink-atm-lambda-modal';
import applyAtmRecordDumpModal from './components/modals/apply-atm-record-dump-modal';
import providerInfoContent from './components/provider-info-content';
import providersList from './components/providers-list';
import shareNotFound from './components/errors/share-not-found';
import openShareFailed from './components/errors/open-share-failed';
import offlineProviders from './components/errors/offline-providers';
import apiSamplesModal from './components/modals/api-samples-modal';
import spacesModals from './components/modals/spaces';

import spaceActions from './services/space-actions';
import groupActions from './services/group-actions';
import clusterActions from './services/cluster-actions';
import privilegeActions from './services/privilege-actions';
import tokenActions from './services/token-actions';
import harvesterActions from './services/harvester-actions';
import workflowActions from './services/workflow-actions';
import userActions from './services/user-actions';
import guiUtils from './services/gui-utils';
import uploadManager from './services/upload-manager';

import atmWorkflow from './utils/atm-workflow';
import showApiSamplesAction from './utils/api-samples-actions/show-api-samples-action';
import removeSpaceFromHarvesterAction from './utils/harvester-actions/remove-space-from-harvester-action';
import addHarvesterToSpaceAction from './utils/space-actions/add-harvester-to-space-action';
import removeHarvesterFromSpaceAction from './utils/space-actions/remove-harvester-from-space-action';
import removeSpaceAction from './utils/space-actions/remove-space-action';
import chooseSpaceToAdvertiseAction from './utils/space-actions/choose-space-to-advertise-action';
import requestSpaceAccessAction from './utils/space-actions/request-space-access-action';
import cleanObsoleteTokensAction from './utils/token-actions/clean-obsolete-tokens-action';
import createTokenAction from './utils/token-actions/create-token-action';
import openCreateTokenViewAction from './utils/token-actions/open-create-token-view-action';
import modifyTokenAction from './utils/token-actions/modify-token-action';
import generateInviteTokenAction from './utils/token-actions/generate-invite-token-action';
import openConsumeTokenViewAction from './utils/token-actions/open-consume-token-view-action';
import consumeInviteTokenAction from './utils/token-actions/consume-invite-token-action';
import toggleBeingOwnerAction from './utils/user-actions/toggle-being-owner-action';
import openCreateAtmInventoryViewAction from './utils/workflow-actions/open-create-atm-inventory-view-action';
import createAtmInventoryAction from './utils/workflow-actions/create-atm-inventory-action';
import modifyAtmInventoryAction from './utils/workflow-actions/modify-atm-inventory-action';
import removeAtmInventoryAction from './utils/workflow-actions/remove-atm-inventory-action';
import applyAtmRecordDumpActionBase from './utils/workflow-actions/apply-atm-record-dump-action-base';
import duplicateAtmRecordRevisionAction from './utils/workflow-actions/duplicate-atm-record-revision-action';
import uploadAtmRecordAction from './utils/workflow-actions/upload-atm-record-action';
import createAtmLambdaAction from './utils/workflow-actions/create-atm-lambda-action';
import dumpAtmLambdaRevisionAction from './utils/workflow-actions/dump-atm-lambda-revision-action';
import createAtmLambdaRevisionAction from './utils/workflow-actions/create-atm-lambda-revision-action';
import modifyAtmLambdaRevisionAction from './utils/workflow-actions/modify-atm-lambda-revision-action';
import unlinkAtmLambdaAction from './utils/workflow-actions/unlink-atm-lambda-action';
import modifyAtmWorkflowSchemaAction from './utils/workflow-actions/modify-atm-workflow-schema-action';
import removeAtmWorkflowSchemaAction from './utils/workflow-actions/remove-atm-workflow-schema-action';
import createAtmWorkflowSchemaAction from './utils/workflow-actions/create-atm-workflow-schema-action';
import dumpAtmWorkflowSchemaRevisionAction from './utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import modifyAtmWorkflowSchemaRevisionAction from './utils/workflow-actions/modify-atm-workflow-schema-revision-action';
import createAtmWorkflowSchemaRevisionAction from './utils/workflow-actions/create-atm-workflow-schema-revision-action';
import removeAtmWorkflowSchemaRevisionAction from './utils/workflow-actions/remove-atm-workflow-schema-revision-action';

const translations = {
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
    atmInventories,
    uploads,
  },
  components: {
    alerts: {
      oneproviderAuthenticationError,
    },
    modals: {
      cleanObsoleteTokensModal,
      generateInviteTokenModal,
      unlinkAtmLambdaModal,
      applyAtmRecordDumpModal,
      apiSamplesModal,
      spaces: spacesModals,
    },
    errors: {
      shareNotFound,
      openShareFailed,
      offlineProviders,
    },
    loginBox,
    contentTokens,
    contentProviderRedirect,
    contentUsers,
    sidebarSpaces,
    sidebarShares,
    sidebarProviders,
    sidebarGroups,
    contentSpacesEmpty,
    contentSpacesIndex,
    contentSpacesConfiguration,
    contentSpacesNew,
    contentProviderEmpty,
    contentSpacesNoSupport,
    contentSpacesSupport,
    contentSpacesProviders,
    contentSpacesMarketplace,
    spacesProvidersOverview,
    contentSpacesData,
    contentSpacesDatasets,
    contentSpacesShares,
    contentSpacesTransfers,
    contentSpacesHarvesters,
    contentSpacesAutomation,
    oneproviderViewContainer,
    contentGroupsNew,
    contentGroupsEmpty,
    contentGroupsMembers,
    contentGroupsHierarchy,
    contentClustersAdd,
    contentClustersEmpty,
    contentClustersAuthenticationError,
    contentClustersEndpointError,
    contentClustersDeregister,
    contentClustersMembers,
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
    joinAsUserModal,
    membershipVisualiser,
    resourceInfoTile,
    resourceMembersTile,
    resourceMembershipTile,
    sidebarHarvesters,
    contentHarvestersNew,
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
    contentPrivacyPolicy,
    contentTermsOfUse,
    publicPage,
    sidebarTokens,
    removeTokenModal,
    contentTokensNew,
    tokenEditor,
    inviteTokenGenerator,
    tokenConsumer,
    contentTokensConsumer,
    tokenTemplateSelector,
    sidebarAtmInventories,
    contentAtmInventoriesEmpty,
    contentAtmInventoriesNew,
    contentAtmInventoriesMembers,
    contentAtmInventoriesLambdas,
    contentAtmInventoriesWorkflows,
    emptyCollectionSidebar,
    providerInfoContent,
    providersList,
    providerTabLi,
    apiSamples,
    spaceConfiguration,
    joinImage,
  },
  services: {
    tokenActions,
    spaceActions,
    groupActions,
    clusterActions,
    privilegeActions,
    harvesterActions,
    workflowActions,
    userActions,
    guiUtils,
    uploadManager,
  },
  utils: {
    atmWorkflow,
    apiSamplesActions: {
      showApiSamplesAction,
    },
    harvesterActions: {
      removeSpaceFromHarvesterAction,
    },
    spaceActions: {
      addHarvesterToSpaceAction,
      removeHarvesterFromSpaceAction,
      removeSpaceAction,
      chooseSpaceToAdvertiseAction,
      requestSpaceAccessAction,
    },
    tokenActions: {
      cleanObsoleteTokensAction,
      createTokenAction,
      openCreateTokenViewAction,
      modifyTokenAction,
      generateInviteTokenAction,
      openConsumeTokenViewAction,
      consumeInviteTokenAction,
    },
    userActions: {
      toggleBeingOwnerAction,
    },
    workflowActions: {
      openCreateAtmInventoryViewAction,
      createAtmInventoryAction,
      modifyAtmInventoryAction,
      removeAtmInventoryAction,
      applyAtmRecordDumpActionBase,
      duplicateAtmRecordRevisionAction,
      uploadAtmRecordAction,
      createAtmLambdaAction,
      dumpAtmLambdaRevisionAction,
      createAtmLambdaRevisionAction,
      modifyAtmLambdaRevisionAction,
      unlinkAtmLambdaAction,
      modifyAtmWorkflowSchemaAction,
      removeAtmWorkflowSchemaAction,
      createAtmWorkflowSchemaAction,
      dumpAtmWorkflowSchemaRevisionAction,
      modifyAtmWorkflowSchemaRevisionAction,
      createAtmWorkflowSchemaRevisionAction,
      removeAtmWorkflowSchemaRevisionAction,
    },
  },
};

export default _.merge({},
  onedataCommonTranslations,
  translations
);
