/**
 * A component that shows a form for creating a group.
 *
 * @module components/content-groups-new
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject } from '@ember/service';

export default Component.extend(I18n, {
  groupActions: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsNew',

  /**
   * @type {string}
   */
  groupName: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.get('element').querySelector('#new-group-name').focus();
  },

  actions: {
    createGroup() {
      const {
        groupName,
        groupActions,
      } = this.getProperties('groupName', 'groupActions');
      return groupActions.createGroup({ name: groupName });
    },
  },
});
