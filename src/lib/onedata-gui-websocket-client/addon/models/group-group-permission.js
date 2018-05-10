/**
 * A set of single group permissions for a single (sub)group
 * 
 * @module models/group-group-permission
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Model.extend({
  /**
   * EntityId of the group that is a context for permissions
   */
  groupId: attr('string'),

  /**
   * GRI of the group which permissions are described in the model
   */
  sharedGroupGri: attr('string'),

  /**
   * It is an object with key-value pairs: permission -> true/false.
   * WARNING: It is intended to be an immutable data structure! To persist 
   * modifications it must be replaced by a new object.
   */
  permissions: attr('object'),

  /**
   * @type {Ember.ComputedProperty<models/shared-group>}
   */
  sharedGroup: computed('groupId', 'sharedGroupGri', function () {
    const {
      store,
      groupId,
      sharedGroupGri,
    } = this.getProperties('store', 'groupId', 'sharedGroupGri');

    let promise;
    if (!groupId || !sharedGroupGri) {
      promise = new Promise(() => {});
    } else {
      promise = store.findRecord('shared-group', sharedGroupGri, {
        adapterOptions: {
          _meta: {
            authHint: ['asGroup', groupId],
          },
        },
      });
    }
    return PromiseObject.create({
      promise,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  sharedGroupLoaded: reads('sharedGroup.isFulfilled'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  sharedGroupLoadError: reads('sharedGroup.reason'),
});
