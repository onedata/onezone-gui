/**
 * A sidebar for providers (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-providers
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { inject as service } from '@ember/service';

export default TwoLevelSidebar.extend(I18n, UserProxyMixin, {
  layout,
  currentUser: service(),

  i18nPrefix: 'components.sidebarSpaces',

  classNames: ['sidebar-spaces'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'space',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-spaces/space-item',

  /**
   * @override
   */
  sidebarType: 'spaces',

  secondLevelItems: computed(function getSecondLevelItems() {
    return [{
      id: 'index',
      label: this.t('aspects.index'),
      icon: 'overview',
    }, {
      id: 'providers',
      label: this.t('aspects.providers'),
      icon: 'provider',
    }];
  }),
});
