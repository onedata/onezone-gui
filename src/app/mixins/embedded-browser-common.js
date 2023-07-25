/**
 * Adds methods commonly used in embedded containers, whose are item browsers (eg.
 * file-browser).
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import globals from 'onedata-gui-common/utils/globals';
import GoToFileUrlActionHandler from 'onezone-gui/utils/url-action-handlers/go-to-file';

/**
 * @typedef {Object} BrowserUrlGeneratorOptions
 * @property {Object} [preserveCurrentOptions=false] If true, do not remove current URL
 *   options: dataset, dir, tab. If false, if these are not provided in `options` they are
 *   removed from URL options.
 */

export default Mixin.create({
  modalManager: service(),

  // required property: router: Ember.Router
  // required property: navigationState: Ember.Service
  // required property: embeddedBrowserType: String, one of: 'data', 'datsets', 'share'

  /**
   * @param {String} type one of: data, datasets, shares, transfers
   * @param {Object} options
   * @param {BrowserUrlGeneratorOptions} geneatorOptions
   * @returns {String} URL to browser item (opened or selected)
   */
  getBrowserUrl(type, options, generatorOptions = {}) {
    const {
      router,
      navigationState,
      embeddedBrowserType,
    } = this.getProperties(
      'router',
      'navigationState',
      'embeddedBrowserType'
    );
    const preserveCurrentOptions = generatorOptions.preserveCurrentOptions || false;
    const aspect = type;
    let aspectOptions = Object.assign({}, options);
    const selected = options.selected;
    aspectOptions.selected = (selected instanceof Array) ?
      selected.join(',') : (selected || null);
    // TODO: VFS-7643 remove compatibility with options used in Oneprovider GUI
    // and use common names
    switch (type) {
      case 'datasets':
        aspectOptions.dataset = aspectOptions.datasetId ||
          (preserveCurrentOptions ? undefined : null);
        delete aspectOptions.datasetId;
        break;
      case 'data':
        aspectOptions.dir = aspectOptions.fileId ||
          (preserveCurrentOptions ? undefined : null);
        delete aspectOptions.fileId;
        break;
      case 'transfers':
        aspectOptions.tab = aspectOptions.tabId ||
          (preserveCurrentOptions ? undefined : null);
        delete aspectOptions.tabId;
        break;
      default:
        break;
    }
    if (type === embeddedBrowserType) {
      if (preserveCurrentOptions) {
        for (const option in aspectOptions) {
          if (aspectOptions[option] === undefined) {
            delete aspectOptions[option];
          }
        }
      }
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
    return globals.location.origin + globals.location.pathname +
      router.urlFor(...urlFunctionParams);
  },

  actions: {
    /**
     * @param {Object} options
     * @param {String} options.fileId
     * @param {Array<String>} options.selected
     * @param {BrowserUrlGeneratorOptions} geneatorOptions
     * @returns {String} URL to selected or opened item in file browser
     */
    getDataUrl(options, generatorOptions) {
      return this.getBrowserUrl('data', options, generatorOptions);
    },

    /**
     * @param {Object} options
     * @param {String} options.datasetId
     * @param {Array<String>} options.selected
     * @param {BrowserUrlGeneratorOptions} geneatorOptions
     * @returns {String} URL to selected or opened item in dataset browser
     */
    getDatasetsUrl(options, generatorOptions) {
      return this.getBrowserUrl('datasets', options, generatorOptions);
    },

    /**
     * @param {Object} options
     * @param {String} options.fileId if provided, adds a tab with transfers for specific
     *  file
     * @param {String} options.tabId see transfers tabs in oneprovider-gui
     * @param {BrowserUrlGeneratorOptions} geneatorOptions
     * @returns {String} URL to transfers view
     */
    getTransfersUrl(options, generatorOptions) {
      return this.getBrowserUrl('transfers', options, generatorOptions);
    },

    /**
     * @param {Object} options
     * @param {String} options.shareId
     * @param {BrowserUrlGeneratorOptions} geneatorOptions
     * @returns {String} URL to shares view
     */
    getShareUrl(options, generatorOptions) {
      return this.getBrowserUrl('shares', options, generatorOptions);
    },

    /**
     * @param {Object} options
     * @param {String} options.oneproviderId
     * @param {BrowserUrlGeneratorOptions} geneatorOptions
     * @returns {String} URL to providers settings view
     */
    getProvidersUrl(options, generatorOptions) {
      return this.getBrowserUrl('providers', options, generatorOptions);
    },

    /**
     * @returns {String} URL to create token view
     */
    getAccessTokenUrl() {
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
      return globals.location.origin + globals.location.pathname + this.router.urlFor(
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

    /**
     * @param {string} fileId
     * @param {GoToFileUrlActionHandler.GoToFileActionType} fileAction
     * @returns {string}
     */
    getFileGoToUrl({ fileId, fileAction }) {
      return GoToFileUrlActionHandler.create({ ownerSource: this })
        .generatePrettyUrl({ fileId, fileAction });
    },

    /**
     * @param {ComputedProperty<GoToFileUrlActionHandler.GoToFileActionType>} fileAction
     * @param {boolean} [replaceHistory]
     */
    updateFileAction(fileAction = null, replaceHistory = true) {
      this.navigationState.changeRouteAspectOptions({
        fileAction,
      }, replaceHistory);
    },

    async openRestApiModal(space) {
      return await this.modalManager.show('api-samples-modal', {
        record: space,
        apiSubject: 'space',
      }).hiddenPromise;
    },
  },
});
