/**
 * Table header for member in privileges table.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['table-header'],
  tagName: 'thead',

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.tableHeader',

  /**
   * @virtual
   * @type {string}
   */
  modelTypeTranslation: undefined,
});
