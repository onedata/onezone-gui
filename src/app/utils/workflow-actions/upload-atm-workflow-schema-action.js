/**
 * Uploads workflow schema from JSON file. Needs `atmInventory` passed in context.
 *
 * @module utils/workflow-actions/upload-atm-workflow-schema-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get, setProperties } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { defer } from 'rsvp';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.uploadAtmWorkflowSchemaAction',

  /**
   * @override
   */
  className: 'upload-atm-workflow-schema-action-trigger',

  /**
   * @override
   */
  icon: 'browser-upload',

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @type {HTMLInputElement|null}
   */
  uploadInputElement: null,

  /**
   * @type {RSVP.Defer}
   */
  uploadFileDefer: null,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.mountUploadInput();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.get('uploadFileDefer')) {
        this.fileSelectionCancelled();
      }
      this.unmountUploadInput();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    let file;
    try {
      file = await this.getJsonFile();
      console.log('selected');
      alert('selected');
    } catch (e) {
      console.log('cancel');
      alert('cancel');
      result.cancelIfPending();
      return result;
    }

    let atmWorkflowSchemaPrototype;
    try {
      const fileContent = await this.getFileContent(file);
      atmWorkflowSchemaPrototype = this.generateAtmWorkflowPrototype(fileContent);
    } catch (e) {
      setProperties(result, {
        status: 'failed',
        error: String(this.t('cannotParseFile')),
      });
      return result;
    }

    return await result.interceptPromise(
      this.createAtmWorkflowSchema(atmWorkflowSchemaPrototype)
    ).then(() => result, () => result);
  },

  /**
   * @private
   */
  mountUploadInput() {
    const {
      uploadInputElement: existingUploadInputElement,
      _window,
    } = this.getProperties('uploadInputElement', '_window');

    if (existingUploadInputElement) {
      return;
    }

    const _document = _window.document;
    const body = _document.body;
    const input = _document.createElement('input');
    input.style.display = 'none';
    input.classList.add('upload-atm-workflow-schema-action-input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.json');
    input.addEventListener('change', () => {
      if (!input.files || !input.files.length) {
        return;
      }
      const file = input.files[0];
      this.fileSelected(file);
      // We need to clear input, to allow user to upload the same file again later
      // (which, without clearing the input, would not trigger input change).
      input.value = '';
    });
    body.appendChild(input);
    this.set('uploadInputElement', input);
  },

  /**
   * @private
   */
  unmountUploadInput() {
    const uploadInputElement = this.get('uploadInputElement');

    if (!uploadInputElement) {
      return;
    }

    uploadInputElement.parentElement.removeChild(uploadInputElement);
    this.set('uploadInputElement', null);
  },

  /**
   * @private
   * @returns {Promise<File>}
   */
  async getJsonFile() {
    const {
      uploadInputElement,
      uploadFileDefer: existingUploadFileDefer,
      _window,
    } = this.getProperties('uploadInputElement', 'uploadFileDefer', '_window');
    if (existingUploadFileDefer) {
      this.fileSelectionCancelled();
    }
    const newUploadFileDefer = this.set('uploadFileDefer', defer());
    _window.addEventListener('focus', () => {
      // Wait for input change event to be processed (especially in mobile
      // browsers and macOS).
      setTimeout(() => {
        if (this.get('uploadFileDefer') === newUploadFileDefer) {
          this.fileSelectionCancelled();
        }
      }, 2000);
    }, { once: true });
    uploadInputElement.click();
    return await newUploadFileDefer.promise;
  },

  /**
   * @private
   * @param {File} file
   */
  fileSelected(file) {
    const uploadFileDefer = this.get('uploadFileDefer');
    if (uploadFileDefer) {
      uploadFileDefer.resolve(file);
      this.set('uploadFileDefer', null);
    }
  },

  /**
   * @private
   */
  fileSelectionCancelled() {
    const uploadFileDefer = this.get('uploadFileDefer');
    if (uploadFileDefer) {
      uploadFileDefer.reject();
      this.set('uploadFileDefer', null);
    }
  },

  /**
   * @private
   * @param {File} file
   * @returns {Promise<String>}
   */
  async getFileContent(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  /**
   * @private
   * @param {String} fileContent
   * @returns {Object}
   */
  generateAtmWorkflowPrototype(fileContent) {
    const spec = JSON.parse(fileContent);

    if (!spec || typeof spec !== 'object') {
      throw new Error('Passed data is not a JSON object.');
    }

    return spec;
  },

  /**
   * @private
   * @param {Object} atmWorkflowSchemaPrototype
   * @returns {Promise<Models.AtmWorkflowSchema>}
   */
  async createAtmWorkflowSchema(atmWorkflowSchemaPrototype) {
    const {
      workflowManager,
      atmInventory,
    } = this.getProperties('workflowManager', 'atmInventory');

    return await workflowManager.createAtmWorkflowSchema(
      get(atmInventory, 'entityId'),
      atmWorkflowSchemaPrototype
    );
  },
});
