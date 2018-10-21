/**
 * Shows modal asking about relation deletion.
 *
 * @module components/remove-relation-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed, get, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import { isArray } from '@ember/array';
import _ from 'lodash';

export default ProceedProcessModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.removeRelationModal',

  /**
   * @override
   */
  modalClass: 'remove-relation-modal',

  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @override
   */
  headerText: computed(
    'parentType',
    'childType',
    function headerText() {
      let {
        childType,
        parentType,
      } = this.getProperties('childType', 'parentType');
      if (childType.includes('And')) {
        childType = 'members';
      }
      return this.t('headerText', {
        childType: this.t('header' + _.upperFirst(childType)),
        parentType: this.t('header' + _.upperFirst(parentType)),
      });
    }
  ),

  /**
   * @override
   */
  messageText: computed(
    'parent.{name,entityType}',
    'child.{name,entityType}',
    function messageText() {
      const {
        parent,
        child,
        childrenNumber,
        parentType,
        childType,
      } = this.getProperties(
        'parent',
        'child',
        'childrenNumber',
        'parentType',
        'childType'
      );
      const parentName = get(parent || {}, 'name');
      let childName;
      if (isArray(child)) {
        childName = get(child[0], 'name');
      } else {
        childName = get(child || {}, 'name');
      }
      let message = this.t('areYouSure', {
        parent: this.t(parentType, { name: parentName }),
        child: this.t(
          childType,
          Object.assign({ name: childName }, childrenNumber)
        ),
      });
      message += '<br><br><strong class="text-danger">';
      if (childType === 'user') {
        message += this.t('operationCauseUser', { childName });
      } else if (childType === 'group') {
        message += this.t('operationCauseMembers');
      } else {
        message += this.t('operationCauseMulti');
      }
      if (parentType !== 'space') {
        message += this.t('allInherited', { parentType, parentName });
      } else {
        message += this.t('onlyParent', { parentType, parentName });
      }
      message += '</strong>';
      return htmlSafe(message);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  parentType: reads('parent.entityType'),

  /**
   * @type {Ember.ComputedProperty<object>}
   */
  childrenNumber: computed(
    'child.entityType,@each.entityType',
    function childrenNumber() {
      let child = this.get('child');
      const childrenTypes = {
        users: 0,
        sharedUsers: 0,
        groups: 0,
      };
      if (!child) {
        return childrenTypes;
      } else {
        if (!isArray(child)) {
          child = [child];
        }
        child.mapBy('entityType')
          .forEach(type => childrenTypes[_.camelCase(type) + 's']++);
        childrenTypes['users'] += childrenTypes['sharedUsers'];
        delete childrenTypes['sharedUsers'];
        return childrenTypes;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string|object>}
   */
  childType: computed('parent.entityType', 'childrenNumber', function () {
    const parentType = this.get('parent.entityType');
    const childrenNumber = this.get('childrenNumber');
    const {
      users,
      groups,
    } = getProperties(childrenNumber, 'users', 'groups');
    if (users + groups === 1) {
      if (users) {
        return 'user';
      } else {
        return parentType === 'group' && groups ? 'subgroup' : 'group';
      }
    } else {
      let type = users ? (users === 1 ? 'user' : 'users') : '';
      type += users && groups ? 'And' : '';
      let groupsPart =
        groups ? (parentType === 'group' ? 'subgroup' : 'group') : '';
      if (groups > 1) {
        groupsPart += 's';
      }
      type += type ? _.upperFirst(groupsPart) : groupsPart;
      return type;
    }
  }),
});
