/**
 * A component with information about no automation inventory available.
 *
 * @module components/content-inventories-empty
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-inventories-empty'],
  i18nPrefix: 'components.contentInventoriesEmpty',
});
