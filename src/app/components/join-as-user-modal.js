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
import { inject as service } from '@ember/service';

export default ProceedProcessModal.extend({
  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.joinAsUserModal',

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
  headerText: computed('modelName', function headerText() {
    return this.t('headerText', {
      modelType: this.t(this.get('modelName')),
    });
  }),

  /**
   * @override
   */
  messageText: computed('modelName', 'model.name', function messageText() {
    return this.t('messageText', {
      modelType: this.t(this.get('modelName')),
      modelName: this.get('model.name'),
    });
  }),

  /**
   * @override
   */
  modalClass: 'join-as-user-modal',

  /**
   * @type {ComputedProperty<String>}
   */
  modelName: computed('model', function modelName() {
    const {
      recordManager,
      model,
    } = this.getProperties('recordManager', 'model');
    return recordManager.getModelNameForRecord(model);
  }),
});
