/**
 * An item-like object to show when item to show is not yet known (typically, when there
 * are invalidated items in replacing chunks array after reload).
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: [
    'spaces-marketplace-item',
    'spaces-marketplace-item-placeholder',
    'iconified-block',
    'iconified-block-marketplace-placeholder',
    // implements infinite scroll list row
    'data-row',
  ],
});
