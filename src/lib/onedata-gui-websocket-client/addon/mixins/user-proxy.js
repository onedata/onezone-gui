/**
 * Adds a `userProxy` property to object containing PromiseObject with current
 * user record.
 *
 * @module mixins/user-proxy
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import ObjectProxy from '@ember/object/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import { computed } from '@ember/object';

const PromiseObject = ObjectProxy.extend(PromiseProxyMixin);

export default Mixin.create({
  /**
   * @virtual
   * @type {Ember.Service} with `getCurrentUserRecord: Promise` method
   */
  currentUser: undefined,

  /**
   * @type <PromiseObject<models/User>>
   */
  userProxy: computed(function () {
    return PromiseObject.create({
      promise: this.get('currentUser').getCurrentUserRecord(),
    });
  }),
});
