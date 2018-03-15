/**
 * A join space view (input for space invitation token)
 *
 * @module components/content-spaces-join
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';

import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  spaceActions: service(),

  i18nPrefix: 'components.contentSpacesJoin',

  /**
   * A join token updated by input element
   * @type {string}
   * @private
   */
  token: undefined,

  didInsertElement() {
    document.getElementById('join-space-token').focus();
  },

  actions: {
    joinSpace(token) {
      return this.get('spaceActions').joinSpace(token);
    },
  },
});
