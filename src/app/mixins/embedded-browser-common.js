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
  // required property: embeddedBrowserType: String, one of: 'data', 'datsets', 'share'

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
      if (type !== 'providers' || !options.oneproviderId) {
        aspectOptions.oneproviderId =
          get(navigationState, 'aspectOptions.oneproviderId') || null;
      }
      for (const option in aspectOptions) {
        if (aspectOptions[option] == null) {
          delete aspectOptions[option];
        }
      }
    }
    const urlFunctionParams = ['onedata.sidebar.content.aspect'];
    // support for choosing a space (needed eg. in shares browser)
    if (options.spaceId) {
      urlFunctionParams.push(
        'spaces',
        options.spaceId,
      );
    }
    urlFunctionParams.push(
      aspect, {
        queryParams: {
          options: serializeAspectOptions(aspectOptions),
        },
      }
    );
    return _location.origin + _location.pathname + router.urlFor(...urlFunctionParams);
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

    /**
     * @param {Object} options
     * @param {String} options.oneproviderId
     * @returns {String} URL to providers settings view
     */
    getProvidersUrl(options) {
      return this.getBrowserUrl('providers', options);
    },

    /**
     * @returns {String} URL to create token view
     */
    getAccessTokenUrl() {
      const {
        router,
        _location,
      } = this.getProperties('router', '_location');
      const tokenTemplate = {
        type: { accessToken: {} },
        caveats: [{
          type: 'interface',
          interface: 'rest',
        }, {
          type: 'service',
          whitelist: ['opw-*'],
        }],
      };
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content',
        'tokens',
        'new', {
          queryParams: {
            options: serializeAspectOptions({
              activeSlide: 'form',
              tokenTemplate: btoa(JSON.stringify(tokenTemplate)),
            }),
          },
        }
      );
    },
  },
});
