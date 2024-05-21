/**
 * Proxy component for Oneprovider's `content-spaces-automation`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';

export default OneproviderEmbeddedContainer.extend(EmbeddedBrowserCommon, {
  layout,

  navigationState: service(),
  globalNotify: service(),
  router: service(),

  /**
   * Entity ID of `space` record that is a space, where workflow are going
   * to be managed.
   * @virtual
   * @type {string}
   */
  spaceEntityId: undefined,

  /**
   * @virtual
   * @type {String}
   */
  tab: undefined,

  /**
   * @virtual
   * @type {String}
   */
  workflowExecutionId: undefined,

  /**
   * @virtual
   * @type {String}
   */
  workflowSchemaId: undefined,

  /**
   * @virtual
   * @type {number|null}
   */
  workflowSchemaRevision: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  fillInputStores: undefined,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-automation',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceEntityId',
    'tab',
    'workflowExecutionId',
    'workflowSchemaId',
    'workflowSchemaRevision',
    'fillInputStores',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'openPreviewTab',
    'closePreviewTab',
    'changeTab',
    'chooseWorkflowSchemaToRun',
    'getDataUrl',
    'getDatasetsUrl',
    'getTransfersUrl',
    'getShareUrl',
    'getGroupUrl',
    'getFileGoToUrl',
    'getAccessTokenUrl',
  ]),

  actions: {
    openPreviewTab(workflowExecutionId) {
      return this.get('navigationState').changeRouteAspectOptions({
        tab: 'preview',
        workflowExecutionId,
      });
    },
    closePreviewTab() {
      const tab = this.get('tab');
      const options = {
        workflowExecutionId: null,
      };
      if (tab === 'preview') {
        options.tab = 'waiting';
      }
      this.get('navigationState').changeRouteAspectOptions(options, true);
    },
    changeTab(tab) {
      return this.get('navigationState').changeRouteAspectOptions({
        tab,
        workflowSchemaId: null,
        workflowSchemaRevision: null,
        fillInputStores: null,
      });
    },
    chooseWorkflowSchemaToRun(workflowSchemaId, workflowSchemaRevision = null) {
      return this.get('navigationState').changeRouteAspectOptions({
        workflowSchemaId,
        workflowSchemaRevision,
        fillInputStores: null,
      }, true);
    },
  },
});
