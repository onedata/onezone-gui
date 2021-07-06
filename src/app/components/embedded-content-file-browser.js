/**
 * Proxy component for Oneprovider's `content-file-browser`.
 * 
 * @module components/embedded-content-file-browser
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';

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

  // TODO: VFS-7633 redundancy; create computed util for getting array from aspectOptions
  /**
   * List of file entity ids that are selected
   * @type {Array<String>}
   */
  selected: computed('navigationState.aspectOptions.selected.[]', {
    get() {
      const rawSelected = this.get('navigationState.aspectOptions.selected');
      return rawSelected && rawSelected.split(',') || [];
    },
    set(key, value) {
      this.get('navigationState').changeRouteAspectOptions({
        selected: value && value.join(',') || null,
      });
      return value;
    },
  }),

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
  },
});
