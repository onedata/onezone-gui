/**
 * Shows modal asking for deleting some record.
 *
 * @module components/record-remove-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default ProceedProcessModal.extend({
  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @virtual
   * @type {Object}
   */
  record: undefined,

  /**
   * @override
   */
  messageText: computed('record.name', function messageText() {
    const name = this.get('record.name');
    return htmlSafe(
      this.t('areYouSure', { name }) +
      '<br><br><strong class="text-danger">' +
      this.t('mayCause', { name }) +
      '</strong>'
    );
  }),
});
