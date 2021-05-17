import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { collect, bool } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-workflows-list-view'],

  i18n: service(),

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
   * @param {Models.AtmWorkflowSchema}
   * @returns {any}
   */
  onOpenAtmWorkflowSchema: notImplementedIgnore,

  /**
   * @virtual
   * @type {Boolean}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasManageWorkflowSchemasPrivilege: bool('atmInventory.privileges.manageWorkflowSchemas'),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmWorkflowSchema>>}
   */
  atmWorkflowSchemasProxy: promise.array(
    computed('atmInventory', function atmWorkflowSchemas() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        return resolve([]);
      }
      return get(atmInventory, 'atmWorkflowSchemaList')
        .then(atmWorkflowSchemaList => get(atmWorkflowSchemaList, 'list'));
    })
  ),

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
   * @override
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addNewAtmWorkflowSchemaAction'),

  init() {
    this._super(...arguments);
    this.registerViewActions();
  },

  registerViewActions() {
    const {
      onRegisterViewActions,
      globalActions,
    } = this.getProperties('onRegisterViewActions', 'globalActions');

    onRegisterViewActions(globalActions);
  },
});
