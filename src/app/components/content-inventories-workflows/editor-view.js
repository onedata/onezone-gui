import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';
import { get, getProperties } from '@ember/object';
import { reject } from 'rsvp';

export default Component.extend({
  classNames: ['content-inventories-workflows-editor-view'],

  workflowActions: service(),

  /**
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    async changeName(newName) {
      const {
        workflowActions,
        atmWorkflowSchema,
      } = this.getProperties('workflowActions', 'atmWorkflowSchema');

      if (!newName) {
        return reject();
      }
      if (!get(atmWorkflowSchema, 'name') === newName) {
        return;
      }

      const action = workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema,
        atmWorkflowSchemaDiff: {
          name: newName,
        },
      });
      const result = await action.execute();
      const {
        status,
        error,
      } = getProperties(result, 'status', 'error');
      if (status == 'failed') {
        throw error;
      }
    },
  },
});
