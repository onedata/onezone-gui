/**
 * Uploads automation record from JSON file.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import ActionResult from 'onedata-gui-common/utils/action-result';
import EmberObject, { computed, get, set } from '@ember/object';
import { notEmpty } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import { defer, Promise } from 'rsvp';
import config from 'ember-get-config';
import ObjectProxy from '@ember/object/proxy';
import ApplyAtmRecordDumpActionBase from 'onezone-gui/utils/workflow-actions/apply-atm-record-dump-action-base';

export default ApplyAtmRecordDumpActionBase.extend({
  workflowManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.uploadAtmRecordAction',

  /**
   * @override
   */
  icon: 'browser-upload',

  /**
   * @type {DumpLoader}
   */
  dumpLoader: undefined,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @override
   */
  className: computed('atmModelName', function className() {
    return `upload-atm-record-action-trigger upload-${dasherize(this.atmModelName)}-action-trigger`;
  }),

  /**
   * @override
   */
  disabled: notEmpty('missingPrivilegeFlags'),

  /**
   * @override
   */
  tip: computed('missingPrivilegeFlags.[]', function tip() {
    return this.missingPrivilegeFlags.length ? insufficientPrivilegesMessage({
      i18n: this.i18n,
      modelName: 'atmInventory',
      privilegeFlag: this.missingPrivilegeFlags,
    }) : '';
  }),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  missingPrivilegeFlags: computed(
    'atmModelName',
    'atmInventory.privileges',
    function missingPrivileges() {
      const missing = [];

      if (
        this.atmModelName === 'atmWorkflowSchema' &&
        !this.atmInventory?.privileges?.manageWorkflowSchemas
      ) {
        missing.push('atm_inventory_manage_workflow_schemas');
      }

      if (!this.atmInventory?.privileges?.manageLambdas) {
        missing.push('atm_inventory_manage_lambdas');
      }

      return missing;
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('dumpLoader', DumpLoader.create({
      atmModelName: this.atmModelName,
      onExternalUpload: () => this.execute(),
      _window: this._window,
    }));
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.dumpLoader.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  async onExecute() {
    const uploadedFileProxy = this.dumpLoader.uploadedFileProxy;
    const result = ActionResult.create();
    const finalizeExecution = () => {
      this.dumpLoader.clearState();
      result.cancelIfPending();
      return result;
    };

    if (!get(uploadedFileProxy, 'content')) {
      try {
        await this.dumpLoader.loadJsonFile();
      } catch (e) {
        return finalizeExecution();
      }
    }

    await this.modalManager.show('apply-atm-record-dump-modal', {
      initialAtmInventory: this.atmInventory,
      atmModelName: this.atmModelName,
      dumpSourceType: 'upload',
      dumpSourceProxy: uploadedFileProxy,
      onReupload: () => this.dumpLoader.loadJsonFile(),
      onSubmit: (data) => this.handleModalSubmit(data, result),
    }).hiddenPromise;

    return finalizeExecution();
  },
});

const DumpLoader = EmberObject.extend({
  /**
   * @virtual
   * @type {DumpableAtmModelName}
   */
  atmModelName: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onExternalUpload: undefined,

  /**
   * @virtual
   * @type {Window}
   */
  _window: undefined,

  /**
   * @private
   * @type {HTMLInputElement|null}
   */
  uploadInputElement: null,

  /**
   * @private
   * @type {RSVP.Defer}
   */
  loadJsonFileDefer: null,

  /**
   * @public
   * @type {ComputedProperty<ObjectProxy<AtmRecordDumpSource>>}
   */
  uploadedFileProxy: computed(() => ObjectProxy.create()),

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
      this.clearState();
      this.unmountUploadInput();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @returns {Promise}
   */
  async loadJsonFile() {
    const {
      loadJsonFileDefer: existingLoadJsonFileDefer,
      _window,
    } = this.getProperties('loadJsonFileDefer', '_window');
    if (existingLoadJsonFileDefer) {
      this.fileSelectionCancelled();
    }
    const newLoadJsonFileDefer = this.set('loadJsonFileDefer', defer());
    _window.addEventListener('focus', () => {
      // Based on https://stackoverflow.com/a/63773257. It does not detect
      // "open file" dialog canellation on iOS and it is hard to find any working
      // solution for that issue. :(
      // Wait for input change event to be processed (especially in mobile
      // browsers and macOS).
      setTimeout(() => {
        if (this.get('loadJsonFileDefer') === newLoadJsonFileDefer) {
          this.fileSelectionCancelled();
        }
      }, 2000);
    }, { once: true });
    this.triggerFileSelection();
    return await newLoadJsonFileDefer.promise;
  },

  /**
   * @public
   */
  clearState() {
    if (this.get('loadJsonFileDefer')) {
      this.fileSelectionCancelled();
    }
    this.set('uploadedFileProxy.content', null);
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
    const _body = _document.body;
    const input = _document.createElement('input');
    input.style.display = 'none';
    input.classList.add('upload-atm-record-action-input');
    input.classList.add(`upload-${dasherize(this.atmModelName)}-action-input`);
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.json');
    input.addEventListener('change', async () => {
      if (!input.files || !input.files.length) {
        return;
      }

      input.disabled = true;
      input.classList.add('loading-file');

      const file = input.files[0];
      await this.fileSelected(file);
      // We need to clear input, to allow user to upload the same file again later
      // (which, without clearing the input, would not trigger input change).
      input.value = '';

      input.classList.remove('loading-file');
      input.disabled = false;
    });
    _body.appendChild(input);
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
   */
  triggerFileSelection() {
    this.get('uploadInputElement').click();
  },

  /**
   * @private
   * @param {File} file
   */
  async fileSelected(file) {
    const {
      loadJsonFileDefer,
      uploadedFileProxy,
      onExternalUpload,
    } = this.getProperties('loadJsonFileDefer', 'uploadedFileProxy', 'onExternalUpload');
    const uploadedFile = await this.parseUploadedFile(file);
    const wasProxyEmpty = !get(uploadedFileProxy, 'content');
    set(uploadedFileProxy, 'content', uploadedFile);
    if (loadJsonFileDefer) {
      // Upload was triggered by action execution. It will create uploadedFileProxy
      // on its own.
      loadJsonFileDefer.resolve();
      this.set('uploadedFileDefer', null);
    } else if (wasProxyEmpty && onExternalUpload) {
      // File selection was triggered from the outside (e.g. by Selenium).
      // We need to perform full action handling from this place.
      onExternalUpload();
    }
  },

  async parseUploadedFile(file) {
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
    return {
      name: file.name,
      dump: parsedContent,
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

    const name = this.atmModelName === 'atmLambda' ?
      parsedContent?.revision?.atmLambdaRevision?.name : parsedContent?.name;
    if (
      typeof name !== 'string' ||
      typeof parsedContent?.revision !== 'object' ||
      !parsedContent?.revision
    ) {
      return null;
    }
    return parsedContent;
  },

  logParsingError(error) {
    if (config.environment !== 'test') {
      console.error('util:workflow-actions/upload-atm-record-action', error);
    }
  },

  /**
   * @private
   */
  fileSelectionCancelled() {
    const loadJsonFileDefer = this.get('loadJsonFileDefer');
    if (loadJsonFileDefer) {
      loadJsonFileDefer.reject();
      this.set('loadJsonFileDefer', null);
    }
  },
});
