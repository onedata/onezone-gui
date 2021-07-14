/**
 * Adds methods commonly used in embedded containers, whose are item browsers (eg.
 * file-browser).
 *
 * @module mixins/embedded-browser-common
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { get } from '@ember/object';

export default Mixin.create({
  // required property: _location: Location
  // required property: router: Ember.Router
  // required property: navigationState: Ember.Service
  // required property: embeddedBrowserType: String, one of: 'data', 'datsets'

  /**
   * @param {String} type one of: data, datasets, shares, transfers
   * @param {Object} options
   * @returns {String} URL to browser item (opened or selected)
   */
  getBrowserUrl(type, options) {
    const {
      _location,
      router,
      navigationState,
      embeddedBrowserType,
    } = this.getProperties(
      '_location',
      'router',
      'navigationState',
      'embeddedBrowserType'
    );
    const aspect = type;
    let aspectOptions = Object.assign({}, options);
    const selected = options.selected;
    aspectOptions.selected = (selected instanceof Array) ?
      selected.join(',') : (selected || null);
    // TODO: VFS-7643 remove compatibility with options used in Oneprovider GUI
    // and use common names
    switch (type) {
      case 'datasets':
        aspectOptions.dataset = aspectOptions.datasetId || null;
        delete aspectOptions.datasetId;
        break;
      case 'data':
        aspectOptions.dir = aspectOptions.fileId || null;
        delete aspectOptions.fileId;
        break;
      case 'transfers':
        aspectOptions.tab = aspectOptions.tabId || null;
        delete aspectOptions.tabId;
        break;
      default:
        break;
    }
    if (type === embeddedBrowserType) {
      aspectOptions = navigationState.mergedAspectOptions(aspectOptions);
    } else {
      // preserve oneprovider in case there is view-changing URL (eg. from data to datasets)
      aspectOptions.oneproviderId =
        get(navigationState, 'aspectOptions.oneproviderId') || null;
      for (const option in aspectOptions) {
        if (aspectOptions[option] == null) {
          delete aspectOptions[option];
        }
      }
    }
    return _location.origin + _location.pathname + router.urlFor(
      'onedata.sidebar.content.aspect',
      aspect, {
        queryParams: {
          options: serializeAspectOptions(aspectOptions),
        },
      });
  },

  actions: {
    /**
     * @param {Object} options
     * @param {String} options.fileId
     * @param {Array<String>} options.selected
     * @returns {String} URL to selected or opened item in file browser
     */
    getDataUrl(options) {
      return this.getBrowserUrl('data', options);
    },

    /**
     * @param {Object} options
     * @param {String} options.datasetId
     * @param {Array<String>} options.selected
     * @returns {String} URL to selected or opened item in dataset browser
     */
    getDatasetsUrl(options) {
      return this.getBrowserUrl('datasets', options);
    },

    /**
     * @param {Object} options
     * @param {String} options.fileId if provided, adds a tab with transfers for specific
     *  file
     * @param {String} options.tabId see transfers tabs in oneprovider-gui
     * @returns {String} URL to transfers view
     */
    getTransfersUrl(options) {
      return this.getBrowserUrl('transfers', options);
    },

    /**
     * @param {Object} options
     * @param {String} options.shareId
     * @returns {String} URL to shares view
     */
    getShareUrl(options) {
      return this.getBrowserUrl('shares', options);
    },
  },
});
