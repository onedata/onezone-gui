/**
 * Shows modal asking about group relation deletion.
 *
 * @module components/group-remove-relation-modal
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
  i18nPrefix: 'components.groupRemoveRelationModal',

  /**
   * @override
   */
  messageText: computed(
    'parentGroup.name',
    'childGroup.name',
    function messageText() {
      return this.t('messageText', {
        parentGroupName: this.get('parentGroup.name'),
        childGroupName: this.get('childGroup.name'),
      });
    }
  ),

  /**
   * @override
   */
  modalClass: 'group-remove-relation-modal',
});
