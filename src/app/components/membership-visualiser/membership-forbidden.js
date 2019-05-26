/**
 * A component, that shows "forbidden" block. Is used internally by
 * membership-visualiser component.
 *
 * @module components/membership-visualiser/membership-forbidden
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['membership-row-element', 'membership-forbidden'],

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membershipForbidden',
});
