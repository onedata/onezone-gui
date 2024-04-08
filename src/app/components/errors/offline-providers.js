/**
 * Component that shows info "All providers are offline".
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/errors/offline-providers';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.errors.offlineProviders',
});
