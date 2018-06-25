/**
 * Provides form that allows to join group as a subgroup.
 *
 * @module components/content-groups-join-as-subgroup
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
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

  actions: {
    joinGroup(token) {
      const {
        group,
        groupActions,
      } = this.getProperties('group', 'groupActions');
      return groupActions.joinGroupAsSubgroup(group, token);
    },
  },
});
