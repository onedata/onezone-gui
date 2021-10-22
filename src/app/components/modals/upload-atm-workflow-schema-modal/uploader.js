import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import config from 'ember-get-config';

export default Component.extend(I18n, {
  classNames: ['uploader'],
  classNameBindings: ['uploadedFile:uploaded-layout:initial-layout'],

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
   * @virtual
   * @type {(uploadedFile: AtmWorkflowSchemaUploadedFile) => void}
   */
  onUploadedFileChange: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  filename: reads('uploadedFile.name'),

  async getUploadedFileFromInput() {
    const inputElement = this.getFileInput();
    if (!inputElement.files || !inputElement.files.length) {
      return null;
    }
    const file = inputElement.files[0];

    let content;
    try {
      content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    } catch (error) {
      this.logParsingError(error);
      content = null;
    }
    const parsedContent = content ? this.parseFileRawContent(content) : null;
    inputElement.value = '';
    return {
      name: file.name,
      content: parsedContent,
    };
  },

  parseFileRawContent(fileRawContent) {
    let parsedContent;
    try {
      parsedContent = JSON.parse(fileRawContent);
    } catch (error) {
      this.logParsingError(error);
      return null;
    }
    if (
      typeof parsedContent !== 'object' || !parsedContent ||
      typeof parsedContent.name !== 'string' ||
      typeof parsedContent.initialRevision !== 'object' || !parsedContent.initialRevision
    ) {
      return null;
    }
    return parsedContent;
  },

  logParsingError(error) {
    if (config.environment !== 'test') {
      console.error(error);
    }
  },

  getFileInput() {
    const element = this.get('element');
    return element ? element.querySelector('.upload-input') : null;
  },

  actions: {
    triggerFileInput() {
      const inputElement = this.getFileInput();
      inputElement && inputElement.click();
    },
    async inputChange() {
      const onUploadedFileChange = this.get('onUploadedFileChange');
      const newUploadedFile = await this.getUploadedFileFromInput();
      if (newUploadedFile && onUploadedFileChange) {
        onUploadedFileChange(newUploadedFile);
      }
    },
  },
});
