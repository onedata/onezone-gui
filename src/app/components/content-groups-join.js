/**
 * A component that shows a form for joining a group.
 *
 * @module components/content-groups-join
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import trimToken from 'onedata-gui-common/utils/trim-token';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  groupActions: service(),

  i18nPrefix: 'components.contentGroupsJoin',

  /**
   * @type {string}
   */
  token: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  trimmedToken: computedPipe('token', trimToken),

  didInsertElement() {
    this._super(...arguments);
    this.$('#join-group-token').focus();
  },

  actions: {
    joinGroup() {
      const {
        groupActions,
        trimmedToken,
      } = this.getProperties('groupActions', 'trimmedToken');

      return groupActions.joinGroup(trimmedToken);
    },
  },
});
