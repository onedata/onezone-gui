/**
 * Proxy component for Oneprovider's `content-file-browser`.
 *
 * @module components/embedded-content-file-browser
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import computedAspectOptionsArray from 'onedata-gui-common/utils/computed-aspect-options-array';

export default OneproviderEmbeddedContainer.extend(EmbeddedBrowserCommon, {
  layout,

  globalNotify: service(),
  router: service(),
  navigationState: service(),

  /**
   * @override
   */
  embeddedBrowserType: 'data',

  /**
   * Entity ID of `space` record that is space of directory displayed in files
   * browser.
   * @type {string}
   */
  spaceEntityId: undefined,

  /**
   * Entity ID of `file` record that is the directory displayed in files
   * browser.
   * @type {string}
   */
  dirEntityId: reads('navigationState.aspectOptions.dir'),

  /**
   * List of file entity ids that are selected
   *
   * **Injected to embedded iframe.**
   * @type {Array<String>}
   */
  selected: computedAspectOptionsArray('selected'),

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-file-browser',

  _location: location,

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze(['spaceEntityId', 'dirEntityId', 'selected']),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDirEntityId',
    'updateSelected',
    'getDataUrl',
    'getDatasetsUrl',
    'getTransfersUrl',
    'getShareUrl',
    'getExecuteWorkflowUrl',
    'getProvidersUrl',
    'getAccessTokenUrl',
    'openRestApiModal',
  ]),

  actions: {
    updateDirEntityId(dirEntityId) {
      this.get('navigationState').changeRouteAspectOptions({
        dir: dirEntityId,
        selected: null,
      });
    },
    updateSelected(selected) {
      this.set('selected', selected);
    },
    getExecuteWorkflowUrl({ workflowSchemaId, workflowSchemaRevision, fillInputStores }) {
      const {
        _location,
        router,
        navigationState,
      } = this.getProperties(
        '_location',
        'router',
        'navigationState',
      );
      const aspectOptions = {
        tab: 'create',
        workflowSchemaId,
        workflowSchemaRevision,
      };
      const oneproviderId = get(navigationState, 'aspectOptions.oneproviderId');
      if (oneproviderId) {
        aspectOptions.oneproviderId = oneproviderId;
      }
      if (fillInputStores) {
        aspectOptions.fillInputStores = 'true';
      }
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content.aspect',
        'automation', {
          queryParams: {
            options: serializeAspectOptions(aspectOptions),
          },
        });
    },
  },
});
