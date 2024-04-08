/**
 * Global share view - show single share accessible from shares > share menu.
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { promise } from 'ember-awesome-macros';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-shares-index'],
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

  actions: {
    clipboardSuccess() {
      this.get('globalNotify').success(this.t('clipboardSuccess'));
    },
    clipboardError() {
      this.get('globalNotify').error(this.t('clipboardError'));
    },
  },
});
