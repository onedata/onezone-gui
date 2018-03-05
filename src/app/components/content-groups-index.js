/**
 * A content page for single group
 *
 * @module components/content-groups-index
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-groups-index'],

  i18n: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsIndex',

  /**
   * @virtual
   * @type {Group}
   */
  group: undefined,
});
