/**
 * Shows modal asking about group leaving.
 *
 * @module components/group-leave-modal
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
  i18nPrefix: 'components.groupLeaveModal',

  /**
   * @override
   */
  messageText: computed(function messageText() {
    return this.t('messageText', { groupName: this.get('group.name') });
  }),

  /**
   * @override
   */
  modalClass: 'group-leave-modal',
});
