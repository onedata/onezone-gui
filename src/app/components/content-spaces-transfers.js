/**
 * Main container for space transfers view
 * 
 * @module components/content-spaces-transfers
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'content-spaces-transfers',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesTransfers',

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
      this.get('navigationState').setAspectOptions({ oneproviderId });
    },
  },
});
