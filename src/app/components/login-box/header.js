/**
 * A login-box header component specific for onezone.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Header from 'onedata-gui-common/components/login-box/header';
import layout from 'onezone-gui/templates/components/login-box/header';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Header.extend(I18n, {
  layout,

  i18n: inject(),
  onedataConnection: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.loginBox.header',

  /**
   * Brand subtitle can disappear for a while when login is being done, because the
   * connection is closed and opened and connection attributes are resetted. This
   * property holds the last known non-empty value.
   * @type {string}
   */
  cachedBrandSubtitle: null,

  /**
   * @override
   */
  brandTitle: computed('model.zoneName', function getBrandTitle() {
    return this.get('model.zoneName') || this.t('brandTitle');
  }),

  /**
   * @override
   */
  brandSubtitle: reads('cachedBrandSubtitle'),

  cachedBrandSubtitleUpdater: observer(
    'onedataConnection.brandSubtitle',
    function cachedBrandSubtitleUpdater() {
      const brandSubtitle = this.onedataConnection.brandSubtitle;
      if (brandSubtitle) {
        this.set('cachedBrandSubtitle', brandSubtitle);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.cachedBrandSubtitleUpdater();
  },
});
