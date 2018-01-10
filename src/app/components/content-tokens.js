/**
 * A content page for single selected token
 *
 * @module components/content-tokens
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';

const I18N_PREFIX = 'components.contentTokens.';

export default Component.extend({
  classNames: ['content-tokens'],

  globalNotify: inject(),

  actions: {
    copySuccess() {
      let {
        i18n,
        globalNotify,
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t(I18N_PREFIX + 'tokenCopySuccess'));
    },

    copyError() {
      let {
        i18n,
        globalNotify,
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t(I18N_PREFIX + 'tokenCopyError'));
    },
  },
});
