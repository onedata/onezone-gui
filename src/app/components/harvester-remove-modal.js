/**
 * Shows modal asking for deleting harvester.
 *
 * @module components/harvester-remove-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RecordRemoveModal from 'onezone-gui/components/record-remove-modal';

export default RecordRemoveModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.harvesterRemoveModal',

  /**
   * @override
   */
  modalClass: 'harvester-remove-modal',
});
