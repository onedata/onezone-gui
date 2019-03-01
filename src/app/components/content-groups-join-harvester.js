/**
 * Provides form that allows to join harvester by group.
 *
 * @module components/content-groups-join-harvester
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
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
  i18nPrefix: 'components.contentGroupsJoinHarvester',

  /**
   * @type {Model.Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {string}
   */
  token: '',

  didInsertElement() {
    this._super(...arguments);
    this.$('#join-harvester-token').focus();
  },

  actions: {
    joinHarvester(token) {
      const {
        group,
        groupActions,
      } = this.getProperties('group', 'groupActions');
      return groupActions.joinHarvesterAsGroup(group, token);
    },
  },
});
