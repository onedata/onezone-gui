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
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import bindElementTop from 'onedata-gui-common/utils/bind-element-top';
import $ from 'jquery';

export default Component.extend(
  createDataProxyMixin('initialProvidersList'), {
    classNames: ['content-spaces-data'],

    globalNotify: service(),

    /**
     * @virtual
     * @type {Space}
     */
    space: undefined,

    selectedProvider: undefined,

    providerListIsLoaded: false,

    contentIframeBaseUrl: reads('selectedProvider.onezoneHostedBaseUrl'),

    fileBrowserData: computed(
      'space.{name}',
      function iframeData() {
        return {
          space: this.get('space'),
          spaceName: this.get('space.name'),
        };
      }
    ),

    iframeActions: computed(
      function iframeActions() {
        return {
          hello: (message) => {
            return this.get('globalNotify').info(message);
          },
        };
      }
    ),

    fileId: 'mock_file_id',

    init() {
      this._super(...arguments);
      // FIXME: make providers tabbed selector
      this.get('initialProvidersListProxy').then(list => {
        safeExec(this, 'set', 'selectedProvider', list.objectAt(0));
      });
      setTimeout(() => {
        this.set('fileId', 'Two');
      }, 4000);
    },

    didInsertElement() {
      this._super(...arguments);
      const updatePosition = bindElementTop({
        $topElement: this.$('.content-spaces-data-header'),
        $leftElement: $('.col-sidebar'),
        $innerElement: this.$('.content-spaces-data-content'),
      });
      $(window).on('resize', updatePosition);
      this.set('updatePosition', updatePosition);
    },

    willDestroyElement() {
      this._super(...arguments);
      $(window).off('resize', this.get('updatePosition'));
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
