/**
 * A sidebar for harvesters (extension of `one-sidebar`)
 *
 * @module components/sidebar-harvesters
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default OneSidebar.extend(I18n, {
  layout,
  classNames: ['sidebar-workflows'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarWorkflows',

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  sidebarType: 'workflows',

  /**
   * @override
   */
  secondLevelItems: computed(function secondLevelItems() {
    return [{
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    }];
  }),
});
