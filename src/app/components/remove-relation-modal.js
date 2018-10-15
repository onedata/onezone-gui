/**
 * Shows modal asking about relation deletion.
 *
 * @module components/remove-relation-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';

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
      return this.t('headerText', {
        childType: this.get('childType'),
        parentType: this.get('parentType'),
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
        parentType,
        childType,
      } = this.getProperties('parent', 'child', 'parentType', 'childType');
      const parentName = get(parent || {}, 'name');
      const childName = get(child || {}, 'name');
      let message = this.t('areYouSure', {
        parentType: this.t(parentType),
        parentName,
        childType: this.t(childType),
        childName,
      });
      message += '<br><br><strong class="text-danger">';
      if (childType === 'user') {
        message += this.t('operationCauseUser', { childName });
      } else {
        message += this.t('operationCauseMembers');
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
   * @type {Ember.ComputedProperty<string>}
   */
  childType: computed('parent.entityType', 'child.entityType', function () {
    const parentType = this.get('parent.entityType');
    const childType = this.get('child.entityType');
    return parentType === 'group' && childType === 'group' ? 'subgroup' : childType;
  }),
});
