/**
 * Main container for space transfers view
 * 
 * @module components/content-spaces-transfers
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: [
    'oneprovider-view-container',
    'content-spaces-transfers',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  navigationState: service(),

  /**
   * @type {string}
   */
  fileId: reads('navigationState.aspectOptions.fileId'),

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  /**
   * @type {string}
   */
  tab: reads('navigationState.aspectOptions.tab'),

  actions: {
    oneproviderIdChanged(oneproviderId) {
      this.get('navigationState').setAspectOptions({
        oneproviderId,
      });
    },
  },
});
