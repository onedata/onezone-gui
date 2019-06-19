/**
 * A component that shows a form for joining a harvester.
 *
 * @module components/content-harvesters-join
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  harvesterActions: service(),

  i18nPrefix: 'components.contentHarvestersJoin',

  /**
   * @type {string}
   */
  token: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.$('#join-harvester-token').focus();
  },

  actions: {
    joinHarvester(token) {
      return this.get('harvesterActions').joinHarvester(token);
    },
  },
});
