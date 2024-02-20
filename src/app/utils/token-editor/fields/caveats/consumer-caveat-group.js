/**
 * Consumer caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { promise } from 'ember-awesome-macros';
import { ModelTagsField, caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const ConsumerField = ModelTagsField.extend({
  ...caveatCustomFieldCommonExtension,

  recordManager: service(),
  userManager: service(),
  groupManager: service(),

  /**
   * @override
   */
  name: 'consumer',

  /**
   * @override
   */
  models: computed(function models() {
    return [{
      name: 'user',
      getRecords: () => this.usersProxy,
    }, {
      name: 'group',
      getRecords: () => this.groupsProxy,
    }, {
      name: 'provider',
      getRecords: () => this.providersProxy,
    }];
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.User>>}
   */
  usersProxy: computed(function usersProxy() {
    return this.userManager.getAllKnownUsers();
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.Group>>}
   */
  groupsProxy: computed(function groupsProxy() {
    return this.groupManager.getAllKnownGroups();
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.Provider>>}
   */
  providersProxy: promise.array(computed(function providersProxy() {
    return this.recordManager.getUserRecordList('provider')
      .then((providers) => get(providers, 'list'));
  })),
});

export const ConsumerCaveatGroup = createCaveatGroup('consumer', {}, [ConsumerField]);
