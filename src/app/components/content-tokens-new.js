/**
 * A component for creating new tokens
 *
 * @module components/content-tokens-new
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  tokenActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',

  actions: {
    submit(rawToken) {
      const createTokenAction = this.get('tokenActions')
        .createCreateTokenAction({ rawToken });

      return createTokenAction.execute();
    },
  },
});
