/**
 * A join space view (input for space invitation token)
 *
 * @module components/content-spaces-join
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import trimToken from 'onedata-gui-common/utils/trim-token';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
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

  /**
   * @type {ComputedProperty<String>}
   */
  trimmedToken: computedPipe('token', trimToken),

  didInsertElement() {
    document.getElementById('join-space-token').focus();
  },

  actions: {
    joinSpace() {
      const {
        spaceActions,
        trimmedToken,
      } = this.getProperties('spaceActions', 'trimmedToken');

      return spaceActions.joinSpace(trimmedToken);
    },
  },
});
