/**
 * Global share view - show single share accessible from shares > share menu.
 * 
 * @module components/content-shares-index
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { promise } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'content-shares-index',
    'absolute-flex-content',
    'no-pointer-events',
  ],
  classNameBindings: ['spaceProxy.isFulfilled:is-loaded'],

  navigationState: service(),
  shareManager: service(),
  pointerEvents: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSharesIndex',

  /**
   * @virtual
   * @type {Models.Share}
   */
  share: undefined,

  spaceProxy: promise.object(computed('share', function space() {
    const {
      share,
      shareManager,
    } = this.getProperties('share', 'shareManager');
    return shareManager.getSpaceForShare(share);
  })),

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  actions: {
    oneproviderIdChanged(oneproviderId) {
      this.get('navigationState').setAspectOptions({ oneproviderId });
    },
    clipboardSuccess() {
      this.get('globalNotify').success(this.t('clipboardSuccess'));
    },
    clipboardError() {
      this.get('globalNotify').error(this.t('clipboardError'));
    },
  },
});
