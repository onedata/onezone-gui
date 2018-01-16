/**
 * A component with information about no available token.
 *
 * @module components/content-tokens-empty
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-tokens-empty'],

  clientTokenActions: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensEmpty',

  actions: {
    createToken() {
      return this.get('clientTokenActions').createToken();
    },
  },
});
