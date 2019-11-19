/**
 * Shows modal asking about token deletion.
 *
 * @module components/remove-token-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed } from '@ember/object';

export default ProceedProcessModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.removeTokenModal',

  /**
   * @override
   */
  modalClass: 'remove-token-modal',

  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @override
   */
  messageText: computed('token.name', function messageText() {
    return this.t('messageText', {
      tokenName: this.get('token.name'),
    });
  }),
});
