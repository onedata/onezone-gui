/**
 * Shows modal asking about index deletion.
 *
 * @module components/content-harvesters-indices/remove-index-modal
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
  i18nPrefix: 'components.contentHarvestersIndices.removeIndexModal',

  /**
   * @override
   */
  modalClass: 'remove-index-modal',

  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @type {Models.Index}
   * @virtual
   */
  index: null,

  /**
   * @override
   */
  messageText: computed('index.name', function messageText() {
    return this.t('messageText', {
      indexName: this.get('index.name'),
    });
  }),
});
