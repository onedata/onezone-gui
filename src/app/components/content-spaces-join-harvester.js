/**
 * Provides form that allows to join harvester by space
 *
 * @module components/content-spaces-join-harvester
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
  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesJoinHarvester',

  /**
   * @type {Group}
   * @virtual
   */
  space: undefined,

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
    this.$('#join-harvester-token').focus();
  },

  actions: {
    joinHarvester() {
      const {
        space,
        spaceActions,
        trimmedToken,
      } = this.getProperties('space', 'spaceActions', 'trimmedToken');

      return spaceActions.joinSpaceToHarvester(space, trimmedToken);
    },
  },
});
