/**
 * Shows information about number of members for given record. It is a tile
 * component ready to place in overview page.
 *
 * @module components/resource-members-tile
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { computed, get } from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.resourceMembersTile',

  /**
   * @type {GraphSingleModel}
   * @virtual
   */
  record: undefined,

  /**
   * @type {Ember.ComputedProperty<PromiseObject<EmberObject>>}
   */
  membersProxy: computed('record', function membersProxy() {
    const record = this.get('record');
    return PromiseObject.create({
      promise: Promise.all([
        get(record, 'groupList'),
        get(record, 'userList'),
        get(record, 'effGroupList'),
        get(record, 'effUserList'),
      ]).then(([groupList, userList, effGroupList, effUserList]) => {
        return EmberObject.create({
          groupList,
          userList,
          effGroupList,
          effUserList,
        });
      }),
    });
  }),
});
