/**
 * Provides form that allows to join harvester by space
 *
 * @module components/content-spaces-join-harvester
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
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

  didInsertElement() {
    this._super(...arguments);
    this.$('#join-harvester-token').focus();
  },

  actions: {
    joinHarvester(token) {
      const {
        space,
        spaceActions,
      } = this.getProperties('space', 'spaceActions');
      return spaceActions.joinSpaceToHarvester(space, token);
    },
  },
});