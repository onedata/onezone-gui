/**
 * A component, that shows "more" block. Is used internally by
 * membership-visualiser component.
 *
 * @module components/membership-visualiser/membership-more
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['membership-element', 'membership-more'],

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membershipMore',
});
