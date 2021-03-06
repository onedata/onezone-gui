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
   * @type {Window}
   */
  _window: window,

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    let file;
    try {
      file = await this.getJsonFile();
    } catch (e) {
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

  async getJsonFile() {
    return await new Promise((resolve, reject) => {
      const _window = this.get('_window');

      // Based on https://stackoverflow.com/a/63773257. It does not detect
      // "open file" dialog canellation on iOS and it is hard to find any working
      // solution for that issue. :(
      let lock = false;
      const _document = _window.document;
      const input = _document.createElement('input');
      input.style.display = 'none';
      input.setAttribute('type', 'file');
      input.setAttribute('accept', '.json');
      input.addEventListener('change', () => {
        lock = true;
        const file = input.files[0];
        resolve(file);
      }, { once: true });
      _window.addEventListener('focus', () => {
        // Wait for input change event to be processed (especially in mobile
        // browsers and macOS).
        setTimeout(() => {
          if (!lock) {
            reject();
          }
        }, 2000);
      }, { once: true });

      input.click();
    });
  },

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

  generateAtmWorkflowPrototype(fileContent) {
    const spec = JSON.parse(fileContent);

    if (!spec || typeof spec !== 'object') {
      throw new Error('Passed data is not a JSON object.');
    }

    return spec;
  },

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
