/**
 * Group overview page
 *
 * @module components/content-groups-index
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  i18n: service(),
  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsIndex',

  /**
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {PromiseObject<User>}
   */
  user: computed(function user() {
    return PromiseObject.create({
      promise: this.get('currentUser').getCurrentUserRecord(),
    });
  }),
});
