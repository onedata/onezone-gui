/**
 * A sidebar for providers (extension of ``one-sidebar``)
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
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
  secondLevelItemsComponent: 'sidebar-spaces/second-level-items',

  /**
   * @override
   */
  sidebarType: 'spaces',
});
