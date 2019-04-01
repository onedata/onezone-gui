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
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { get } from '@ember/object';

export default Component.extend(
  createDataProxyMixin('provider'), {
    router: service(),

    /**
     * @virtual
     * @type {Space}
     */
    space: undefined,

    init() {
      this._super(...arguments);
      this.updateProviderProxy();
    },

    /**
     * @override
     */
    fetchProvider() {
      return this.get('space.providerList')
        .then(providerList =>
          get(providerList, 'list').then(list =>
            list.find(provider => get(provider, 'online'))
          )
        );
    },

    actions: {
      transitionAfterFailure() {
        const {
          router,
          space,
        } = this.getProperties('router', 'space');
        router.transitionTo(
          'onedata.sidebar.content.index',
          space,
        );
      },
    },
  });
