/**
 * Test login route.
 * 
 * @module routes/test/login
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend(I18n, {
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'routes.login',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  titleToken: computed(function titleToken() {
    return this.t('signIn');
  }),
});
