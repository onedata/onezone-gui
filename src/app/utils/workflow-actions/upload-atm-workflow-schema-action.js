/**
 * Uploads workflow schema from JSON file. Needs `atmInventory` passed
 * in context.
 *
 * @module utils/workflow-actions/upload-atm-workflow-schema-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ActionResult from 'onedata-gui-common/utils/action-result';
import EmberObject, { computed, get, set } from '@ember/object';
import { bool, not } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import { defer, Promise } from 'rsvp';
import config from 'ember-get-config';
import ObjectProxy from '@ember/object/proxy';
import ApplyAtmWorkflowSchemaDumpActionBase from 'onezone-gui/utils/workflow-actions/apply-atm-workflow-schema-dump-action-base';

export default ApplyAtmWorkflowSchemaDumpActionBase.extend({
  workflowManager: service(),
  modalManager: service(),

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
  disabled: not('hasManageWorkflowSchemasPrivilege'),

  /**
   * @override
   */
  tip: computed(
    'hasManageWorkflowSchemasPrivilege',
    function tip() {
      const {
        i18n,
        hasManageWorkflowSchemasPrivilege,
      } = this.getProperties(
        'i18n',
        'hasManageWorkflowSchemasPrivilege'
      );

      return hasManageWorkflowSchemasPrivilege ? '' : insufficientPrivilegesMessage({
        i18n,
        modelName: 'atmInventory',
        privilegeFlag: 'atm_inventory_manage_workflow_schemas',
      });
    }
  ),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasManageWorkflowSchemasPrivilege: bool('atmInventory.privileges.manageWorkflowSchemas'),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('dumpLoader', DumpLoader.create({
      onExternalUpload: () => this.execute(),
      _window: this.get('_window'),
    }));
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.get('dumpLoader').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  async onExecute() {
    const {
      atmInventory,
      modalManager,
      dumpLoader,
    } = this.getProperties(
      'atmInventory',
      'modalManager',
      'dumpLoader',
    );
    const uploadedFileProxy = get(dumpLoader, 'uploadedFileProxy');
    const result = ActionResult.create();
    const finalizeExecution = () => {
      dumpLoader.clearState();
      result.cancelIfPending();
      return result;
    };

    if (!get(uploadedFileProxy, 'content')) {
      try {
        await dumpLoader.loadJsonFile();
      } catch (e) {
        return finalizeExecution();
      }
    }

    await modalManager.show('apply-atm-workflow-schema-dump-modal', {
      initialAtmInventory: atmInventory,
      dumpSourceType: 'upload',
      dumpSourceProxy: uploadedFileProxy,
      onReupload: () => dumpLoader.loadJsonFile(),
      onSubmit: (data) => this.handleModalSubmit(data, result),
    }).hiddenPromise;

    return finalizeExecution();
  },
});

const DumpLoader = EmberObject.extend({
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
   * @type {ComputedProperty<ObjectProxy<AtmWorkflowSchemaDumpSource>>}
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
    input.classList.add('upload-atm-workflow-schema-action-input');
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
    if (
      typeof parsedContent !== 'object' || !parsedContent ||
      typeof parsedContent.name !== 'string' ||
      typeof parsedContent.revision !== 'object' || !parsedContent.revision
    ) {
      return null;
    }
    return parsedContent;
  },

  logParsingError(error) {
    if (config.environment !== 'test') {
      console.error('util:workflow-actions/upload-atm-workflow-schema-action', error);
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
