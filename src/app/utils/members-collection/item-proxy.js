/**
 * Object used internally by members-collection component. Acts as a container
 * for member record.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import { array, conditional } from 'ember-awesome-macros';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Models.User|Models.Group}
   */
  member: undefined,

  /**
   * @type {Array<Models.User>}
   */
  owners: undefined,

  /**
   * @virtual
   * @type {Array<Models.User|Models.Group>}
   */
  directMembers: undefined,

  /**
   * @virtual
   * @type {Array<Utils.Action>}
   */
  directMemberActions: undefined,

  /**
   * @virtual
   * @type {Array<Utils.Action>}
   */
  effectiveMemberActions: undefined,

  /**
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  privilegesProxy: undefined,

  /**
   * If true, member represents logged-in user
   * @virtual
   * @type {boolean}
   */
  isYou: false,

  /**
   * @type {Ember.ComputedProperty<String>}
   */
  id: reads('member.id'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isOwner: array.includes('owners', 'member'),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  actions: conditional(
    array.includes('directMembers', 'member'),
    'directMemberActions',
    'effectiveMemberActions'
  ),
});
