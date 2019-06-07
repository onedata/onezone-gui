/**
 * TODO: Prototype of go to first online Onprovider that supports this space
 * Need to implement:
 * - disable item in sidebar when there is no Oneprovider supporting
 * - disable/show error sign when no Oneprovider is online
 * - or for above: make views/graphics that are shown
 * - external link icon?
 * - write tests
 * 
 * @module components/content-spaces-data
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';

export default Component.extend(
  createDataProxyMixin('initialProvidersList'), {
    classNames: ['content-spaces-data'],

    globalNotify: service(),

    /**
     * Space selected in sidebar to show its data using one of available
     * Oneproviders.
     * @virtual
     * @type {models.Space}
     */
    space: undefined,

    /**
     * Opened directory's file entity ID.
     * Currently mocked value.
     * @virtual
     */
    fileId: 'mock_file_id',

    /**
     * One of the Oneproviders that support `space` which will be used
     * to show file browser.
     * @virtual
     * @type {models.Provider}
     */
    selectedProvider: undefined,

    /**
     * Iframe is fixed-positioned to sidebar and header of data space content.
     * Invoking this function cause iframe position to be updated.
     * @type {Function}
     */
    updateIframePosition: undefined,

    /**
     * Will be set to true when supporting Oneproviders data is loaded.
     * @type {boolean}
     */
    providerListIsLoaded: false,

    /**
     * `baseUrl` property for embedded component container.
     * It is URL with path to selected Oneprovider served web application.
     * @type {ComputedProperty<string>}
     */
    contentIframeBaseUrl: reads('selectedProvider.onezoneHostedBaseUrl'),

    init() {
      this._super(...arguments);
      // TODO: this should be selected using tabbed selector
      this.get('initialProvidersListProxy').then(list => {
        safeExec(this, 'set', 'selectedProvider', list.objectAt(0));
      });
      // TODO: to remove - testing purposes
      setTimeout(() => {
        this.set('fileId', 'Two');
      }, 4000);
    },

    willDestroyElement() {
      this._super(...arguments);
      $(window).off('resize', this.get('updateIframePosition'));
    },

    /**
     * @override
     * @returns {Promise}
     */
    fetchInitialProvidersList() {
      return this.get('space.providerList')
        .then(providerList => get(providerList, 'list'));
    },

    actions: {
      hello(message) {
        this.get('globalNotify').info(message);
      },
    },
  });
