/**
 * Shows modal asking about group deletion.
 *
 * @module components/group-remove-modal
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RecordRemoveModal from 'onezone-gui/components/record-remove-modal';

export default RecordRemoveModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.groupRemoveModal',

  /**
   * @override
   */
  modalClass: 'group-remove-modal',
});
