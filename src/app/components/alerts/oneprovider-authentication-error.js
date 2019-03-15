/**
 * Content for message when despite of valid session, some Oneprovider cannot
 * authenticate and keeps redirecting to Onezone.
 * 
 * @module components/alerts/oneprovider-authentication-error
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.alerts.oneproviderAuthenticationError',
});
