import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['uploader'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.uploadAtmWorkflowSchemaModal.uploader',

  /**
   * @virtual
   * @type {AtmWorkflowSchemaUploadedFile}
   */
  uploadedFile: undefined,

  /**
   * @type {() => void}
   */
  reuploadCallback: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  filename: reads('uploadedFile.name'),

  actions: {
    triggerReupload() {
      const reuploadCallback = this.get('reuploadCallback');
      reuploadCallback && reuploadCallback();
    },
  },
});
