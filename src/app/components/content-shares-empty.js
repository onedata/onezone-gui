/**
 * A component with information about no shares available
 *
 * @module components/content-shares-empty
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-shares-empty'],
  i18nPrefix: 'components.contentSharesEmpty',
});
