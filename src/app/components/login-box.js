/**
 * A login-box component specific for onezone
 *
 * @module components/login-box
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject } from '@ember/service';
import { computed } from '@ember/object';
import LoginBox from 'onedata-gui-common/components/login-box';

// TODO
// const I18N_PREFIX = 'components.loginBox.';

export default LoginBox.extend({
  i18n: inject(),

  /**
   * @override
   */
  isLoaded: computed.reads('_isZoneNameLoaded'),

  /**
   * If true, zone name is loaded
   * @type {boolean}
   */
  _isZoneNameLoaded: false,

  init() {
    this._super(...arguments);
    this._loadZoneName();
  },

  /**
   * Loads zone name from backend
   * @returns {undefined}
   */
  _loadZoneName() {
    this.set('headerModel.zoneName', 'zone1');
    this.set('_isZoneNameLoaded', true);

    // TODO load from backend
    // const {
    //   onezoneServer,
    //   i18n,
    // } = this.getProperties('onezoneServer', 'i18n');
    // onezoneServer.getZoneName()
    //   .then(data => this.set(
    //     'headerModel.zoneName',
    //     data.zoneName || i18n.t(I18N_PREFIX + 'unknownZoneName')
    //   )).catch(error => this.set(
    //     'errorMessage',
    //     `${i18n.t(I18N_PREFIX + 'getZoneNameError')}: ${error.message}`
    //   )).then(() => this.set('_isZoneNameLoaded', true));
  },
});
