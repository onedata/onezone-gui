/**
 * Container for remote file browser of single space with Oneprovider selector
 * 
 * @module components/content-spaces-data
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'content-spaces-data',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  navigationState: service(),

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesData',

  actions: {
    oneproviderIdChanged(oneproviderId) {
      this.get('navigationState').setAspectOptions({
        oneproviderId,
      });
    },
  },
});
