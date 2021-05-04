import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['content-inventories-workflows-list-view'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesWorkflows.listView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onAddWorkflowSchema: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.AtmWorkflowSchema}
   * @returns {any}
   */
  onOpenWorkflowSchema: notImplementedIgnore,

  /**
   * @virtual
   * @type {Boolean}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmWorkflowSchema>>}
   */
  workflowSchemasProxy: promise.array(
    computed('atmInventory', function workflowSchemas() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        return resolve([]);
      }
      return get(atmInventory, 'workflowSchemaList')
        .then(workflowSchemaList => get(workflowSchemaList, 'list'));
    })
  ),

  addNewWorkflowSchemaAction: computed(function addNewWorkflowSchemaAction() {
    return {
      action: () => this.get('onAddWorkflowSchema')(),
      title: this.t('addWorkflowSchemaButton'),
      class: 'open-add-workflow-schema-trigger',
      icon: 'add-filled',
    };
  }),

  /**
   * @override
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addNewWorkflowSchemaAction'),

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
