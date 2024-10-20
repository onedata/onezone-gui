/**
 * Lists workflow schemas. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import { computed, get, getProperties } from '@ember/object';
import { collect, bool } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-workflows-list-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.listView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onAddAtmWorkflowSchema: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.AtmWorkflowSchema} atmWorkflowSchema
   * @param {Number} revision
   * @returns {any}
   */
  onOpenAtmWorkflowSchemaRevision: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.AtmWorkflowSchema} atmWorkflowSchema
   * @param {RevisionNumber} revisionNumber
   * @returns {any}
   */
  onCreatedAtmWorkflowSchemaRevision: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Array<Utils.Action>} actions
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @type {Utils.Action | null}
   */
  uploadAtmWorkflowSchemaActionCache: null,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasManageWorkflowSchemasPrivilege: bool('atmInventory.privileges.manageWorkflowSchemas'),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmWorkflowSchema>>}
   */
  atmWorkflowSchemasProxy: promise.array(
    computed('atmInventory.privileges.view', async function atmWorkflowSchemasProxy() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        return resolve([]);
      }
      if (!get(atmInventory, 'privileges.view')) {
        throw { id: 'forbidden' };
      }
      const atmWorkflowSchemaList = await get(atmInventory, 'atmWorkflowSchemaList');
      return atmWorkflowSchemaList ? (await get(atmWorkflowSchemaList, 'list')) : [];
    })
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  addNewAtmWorkflowSchemaAction: computed(
    'hasManageWorkflowSchemasPrivilege',
    function addNewAtmWorkflowSchemaAction() {
      const {
        hasManageWorkflowSchemasPrivilege,
        i18n,
      } = this.getProperties('hasManageWorkflowSchemasPrivilege', 'i18n');
      return {
        action: () => this.get('onAddAtmWorkflowSchema')(),
        title: this.t('addAtmWorkflowSchemaButton'),
        class: 'open-add-atm-workflow-schema-trigger',
        buttonStyle: 'primary',
        disabled: !hasManageWorkflowSchemasPrivilege,
        tip: hasManageWorkflowSchemasPrivilege ?
          undefined : insufficientPrivilegesMessage({
            i18n,
            modelName: 'atmInventory',
            privilegeFlag: 'atm_inventory_manage_workflow_schemas',
          }),
        icon: 'add-filled',
      };
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  uploadAtmWorkflowSchemaAction: computed(
    'atmInventory',
    'onOpenAtmWorkflowSchemaRevision',
    function uploadAtmWorkflowSchemaAction() {
      this.uploadAtmWorkflowSchemaActionCache?.destroy();
      this.uploadAtmWorkflowSchemaActionCache =
        this.workflowActions.createUploadAtmRecordAction({
          atmModelName: 'atmWorkflowSchema',
          atmInventory: this.atmInventory,
        });
      // After successful workflow schema upload, open it
      this.uploadAtmWorkflowSchemaActionCache.addExecuteHook(actionResult => {
        const {
          status,
          result,
        } = getProperties(actionResult, 'status', 'result');
        if (status === 'done' && result) {
          const {
            atmRecord,
            revisionNumber,
          } = result;
          if (atmRecord && revisionNumber) {
            this.onOpenAtmWorkflowSchemaRevision?.(atmRecord, revisionNumber);
          }
        }
      });

      return this.uploadAtmWorkflowSchemaActionCache;
    }
  ),

  /**
   * @override
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect(
    'uploadAtmWorkflowSchemaAction',
    'addNewAtmWorkflowSchemaAction'
  ),

  init() {
    this._super(...arguments);
    this.registerViewActions();
  },

  willDestroyElement() {
    try {
      [
        'uploadAtmWorkflowSchemaAction',
      ].forEach(propName => {
        const prop = this.cacheFor(propName);
        prop && prop.destroy();
      });
    } finally {
      this._super(...arguments);
    }
  },

  registerViewActions() {
    const {
      onRegisterViewActions,
      globalActions,
    } = this.getProperties('onRegisterViewActions', 'globalActions');

    onRegisterViewActions(globalActions);
  },
});
