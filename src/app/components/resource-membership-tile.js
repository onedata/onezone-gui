/**
 * Shows information about user membership for given record. It is a tile
 * component ready to place in overview page.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { inject as service } from '@ember/service';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

export default Component.extend(I18n, UserProxyMixin, {
  tagName: '',

  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.resourceMembershipTile',

  /**
   * @virtual
   * @type {GraphSingleModel}
   * E.g. group or space
   */
  record: undefined,

  /**
   * Query params passed to link-to in tile.
   * @type {Object}
   */
  queryParams: computed('currentUser.userId', function queryParams() {
    return {
      aspect: 'memberships',
      options: serializeAspectOptions({
        member: this.currentUser.userId,
      }),
    };
  }),
});
