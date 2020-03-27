/**
 * A component that shows a form for joining a harvester.
 *
 * @module components/content-harvesters-join
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
  harvesterActions: service(),

  i18nPrefix: 'components.contentHarvestersJoin',

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
    this.$('#join-harvester-token').focus();
  },

  actions: {
    joinHarvester() {
      const {
        harvesterActions,
        trimmedToken,
      } = this.getProperties('harvesterActions', 'trimmedToken');

      return harvesterActions.joinHarvester(trimmedToken);
    },
  },
});
