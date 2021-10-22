import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} AtmWorkflowSchemaUploadedFile
 * @property {String} name
 * @property {any} content
 */

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.uploadAtmWorkflowSchemaModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  modalOptions: undefined,

  /**
   * @type {AtmWorkflowSchemaUploadedFile}
   */
  uploadedFile: undefined,

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {Boolean}
   */
  isReadyToApply: false,

  /**
   * @type {ComputedProperty<Object>}
   */
  dump: reads('uploadedFile.content'),

  actions: {
    uploadedFileChanged(uploadedFile) {
      this.set('uploadedFile', uploadedFile);
    },
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        await submitCallback();
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
