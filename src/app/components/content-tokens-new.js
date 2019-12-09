/**
 * A component for creating new tokens
 *
 * @module components/content-tokens-new
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { getProperties } from '@ember/object';
import moment from 'moment';

export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  tokenActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',

  actions: {
    create({ values }) {
      const tokenActions = this.get('tokenActions');
      const {
        name,
        validUntilEnabled,
        validUntil,
      } = getProperties(values, 'name', 'validUntilEnabled', 'validUntil');

      const tokenPrototype = {
        name,
        caveats: [],
      };

      if (validUntilEnabled) {
        tokenPrototype.caveats.push({
          type: 'time',
          validUntil: moment(validUntil).unix(),
        });
      }

      return tokenActions.createToken(tokenPrototype);
    },
  },
});
