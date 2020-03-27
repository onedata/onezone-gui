/**
 * Provides form that allows to join cluster by group.
 *
 * @module components/content-groups-join-cluster
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
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
  i18nPrefix: 'components.contentGroupsJoinCluster',

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
    this.$('#join-cluster-token').focus();
  },

  actions: {
    joinCluster() {
      const {
        group,
        groupActions,
        trimmedToken,
      } = this.getProperties('group', 'groupActions', 'trimmedToken');

      return groupActions.joinClusterAsGroup(group, trimmedToken);
    },
  },
});
