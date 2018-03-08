/**
 * A component with information about no available group.
 *
 * @module components/content-groups-empty
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-groups-empty'],

  i18nPrefix: 'components.contentGroupsEmpty',
});
