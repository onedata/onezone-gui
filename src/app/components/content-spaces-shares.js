/**
 * Container for signed-in user's shared file browser
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-spaces-transfers'],

  navigationState: service(),
  shareManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesShares',

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
    onShowShareList() {
      const element = this.get('element');
      const contentBackLink = element && element.querySelector('.content-back-link');
      if (contentBackLink) {
        contentBackLink.click();
      }
    },
  },
});
