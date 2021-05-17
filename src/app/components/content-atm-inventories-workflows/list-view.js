import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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

  addNewAtmWorkflowSchemaAction: computed(function addNewAtmWorkflowSchemaAction() {
    return {
      action: () => this.get('onAddAtmWorkflowSchema')(),
      title: this.t('addAtmWorkflowSchemaButton'),
      class: 'open-add-atm-workflow-schema-trigger',
      icon: 'add-filled',
    };
  }),

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
