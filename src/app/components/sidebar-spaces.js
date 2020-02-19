/**
 * A sidebar for providers (extension of ``one-sidebar``)
 *
 * @module components/sidebar-spaces
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { inject as service } from '@ember/service';

export default OneSidebar.extend(I18n, UserProxyMixin, {
  layout,

  /**
   * Note: `currentUser` service is needed by `UserProxyMixin`
   * which is needed by `space-item` to work.
   * @type {Ember.Service}
   */
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
      },
      {
        id: 'data',
        label: this.t('aspects.data'),
        icon: 'browser-directory',
      },
      {
        id: 'shares',
        label: this.t('aspects.shares'),
        icon: 'share',
      },
      {
        id: 'transfers',
        label: this.t('aspects.transfers'),
        icon: 'transfers',
      },
      {
        id: 'providers',
        label: this.t('aspects.providers'),
        icon: 'provider',
      }, {
        id: 'members',
        label: this.t('aspects.members'),
        icon: 'group',
      },
    ];
  }),
});
