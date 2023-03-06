/**
 * Add new cluster using token view
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { bool } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-clusters-add'],

  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersAdd',

  /**
   * @type {ComputedProperty<Models.User>}
   */
  currentUser: computed(function currentUser() {
    return this.get('recordManager').getCurrentUserRecord();
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canCurrentUserInviteProviders: bool('currentUser.canInviteProviders'),
});
