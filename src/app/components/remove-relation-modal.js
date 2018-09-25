/**
 * Shows modal asking about relation deletion.
 *
 * @module components/remove-relation-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed } from '@ember/object';

export default ProceedProcessModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.removeRelationModal',

  /**
   * @override
   */
  messageText: computed(
    'parent.{name,entityType}',
    'child.{name,entityType}',
    function messageText() {
      let parentType = this.get('parent.entityType');
      let childType = this.get('child.entityType');
      if (parentType === 'group' && childType === 'group') {
        parentType = 'parentGroup';
        childType = 'childGroup';
      }
      return this.t('messageText', {
        parentType: this.t(parentType),
        parentName: this.get('parent.name'),
        childType: this.t(childType),
        childName: this.get('child.name'),
      });
    }
  ),

  /**
   * @override
   */
  modalClass: 'remove-relation-modal',
});
