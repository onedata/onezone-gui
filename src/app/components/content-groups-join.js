/**
 * A component that shows a form for joining a group.
 *
 * @module components/content-groups-join
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  groupActions: service(),
  globalNotify: service(),
  router: service(),

  i18nPrefix: 'components.contentGroupsJoin',

  /**
   * @type {string}
   */
  token: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.$('#join-group-token').focus();
  },

  actions: {
    joinGroup(token) {
      return this.get('groupActions').joinGroup(token);
    },
  },
});
