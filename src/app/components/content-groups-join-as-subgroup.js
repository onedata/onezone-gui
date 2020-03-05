/**
 * Provides form that allows to join group as a subgroup.
 *
 * @module components/content-groups-join-as-subgroup
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
  i18n: service(),
  groupActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsJoinAsSubgroup',

  /**
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {string}
   */
  token: '',

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
        group,
        groupActions,
        trimmedToken,
      } = this.getProperties('group', 'groupActions', 'trimmedToken');

      return groupActions.joinGroupAsSubgroup(group, trimmedToken);
    },
  },
});
