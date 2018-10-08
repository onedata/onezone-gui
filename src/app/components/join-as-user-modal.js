/**
 * Shows modal asking about joining to some model.
 *
 * @module components/join-as-user-modal
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
  i18nPrefix: 'components.joinAsUserModal',

  /**
   * @type {string}
   * @virtual
   */
  modelType: undefined,

  /**
   * @type {GriSingleModel}
   * @virtual
   */
  model: undefined,

  /**
   * @override
   */
  proceedButtonClass: 'btn btn-primary proceed',

  /**
   * @override
   */
  headerText: computed('modelType', function headerText() {
    return this.t('headerText', { modelType: this.t(this.get('modelType')) });
  }),

  /**
   * @override
   */
  messageText: computed('modelType', 'model.name', function messageText() {
    return this.t('messageText', {
      modelType: this.get('modelType'),
      modelName: this.get('model.name'),
    });
  }),

  /**
   * @override
   */
  modalClass: 'join-as-user-modal',
});
