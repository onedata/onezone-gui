/**
 * Base compontent of container views (with Oneprovider selector).
 * Template of these components renders `oneprovider-view-container`
 * at the template root (which is tagless) and typically a header and body
 * of the view. The body is typically an embedde component.
 * 
 * @module components/content-oneprovider-container-base
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  navigationState: service(),

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  actions: {
    oneproviderIdChanged(oneproviderId, replaceHistory) {
      this.get('navigationState').setAspectOptions({
        oneproviderId,
      }, replaceHistory);
    },
  },
});
