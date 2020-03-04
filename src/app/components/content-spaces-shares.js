/**
 * Container for signed-in user's shared file browser
 * 
 * @module components/content-spaces-shares
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'content-spaces-transfers',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  navigationState: service(),
  shareManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesShares',

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  /**
   * @type {string}
   */
  shareId: reads('navigationState.aspectOptions.shareId'),

  /**
   * @type {ComputedProperty<String>}
   */
  blankShareIdOptions: computed(
    'navigationState.aspectOptions',
    function blankShareIdOptions() {
      const options = this.get('navigationState').mergedAspectOptions({
        shareId: null,
      });
      return serializeAspectOptions(options);
    }
  ),

  shareProxy: promise.object(computed('shareId', function shareProxy() {
    const {
      shareManager,
      shareId,
    } = this.getProperties('shareManager', 'shareId');
    return shareManager.getShareById(shareId);
  })),

  actions: {
    oneproviderIdChanged(oneproviderId) {
      this.get('navigationState').setAspectOptions({ oneproviderId });
    },
    showShareList() {
      this.$('.content-back-link').click();
    },
  },
});
