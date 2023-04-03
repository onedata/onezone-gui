/**
 * Shows modal asking about space deletion from harvester.
 *
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
  i18nPrefix: 'components.contentHarvestersSpaces.removeSpaceModal',

  /**
   * @override
   */
  modalClass: 'remove-space-modal',

  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @override
   */
  messageText: computed('space.name', 'harvester.name', function messageText() {
    return this.t('messageText', {
      spaceName: this.get('space.name'),
      harvesterName: this.get('harvester.name'),
    });
  }),
});
