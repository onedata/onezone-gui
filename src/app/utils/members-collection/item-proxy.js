/**
 * Object used internally by members-collection component. Acts as a container
 * for member record.
 * 
 * @module utils/members-collection/item-proxy
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {User|Group}
   */
  member: undefined,

  /**
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  privilegesProxy: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  id: reads('member.id'),

  /**
   * If true, member represents logged-in user
   * @virtual
   * @type {boolean}
   */
  isYou: false,
});
