/**
 * Shows modal asking about group deletion.
 *
 * @module components/group-remove-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default ProceedProcessModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.groupRemoveModal',

  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @override
   */
  messageText: computed('group.name', function messageText() {
    const groupName = this.get('group.name');
    return htmlSafe(
      this.t('areYouSure', { groupName }) +
      '<br><br><strong class="text-danger">' +
      this.t('mayCause', { groupName }) +
      '</strong>'
    );
  }),

  /**
   * @override
   */
  modalClass: 'group-remove-modal',
});
