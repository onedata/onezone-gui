/**
 * Edits existing workflow schema. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-workflows/editor-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';
import { get, getProperties, observer } from '@ember/object';
import { reject } from 'rsvp';

export default Component.extend({
  classNames: ['content-atm-inventories-workflows-editor-view'],

  workflowActions: service(),

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * Data injected into the visualiser. Initialized by
   * `atmWorkflowSchemaObserver`, updated by modifications
   * @type {Object}
   */
  visualiserData: undefined,

  atmWorkflowSchemaObserver: observer(
    'atmWorkflowSchema',
    function atmWorkflowSchemaObserver() {
      const atmWorkflowSchema = this.get('atmWorkflowSchema');
      if (!atmWorkflowSchema) {
        return;
      }

      const {
        lanes = [],
          stores = [],
      } = getProperties(atmWorkflowSchema, 'lanes', 'stores');
      this.set('visualiserData', {
        lanes,
        stores,
      });
    }
  ),

  init() {
    this._super(...arguments);
    this.atmWorkflowSchemaObserver();
  },

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
    visualiserDataChange(newVisualiserData) {
      this.set('visualiserData', newVisualiserData);
    },
    async save() {
      const {
        workflowActions,
        atmWorkflowSchema,
        visualiserData,
      } = this.getProperties(
        'workflowActions',
        'atmWorkflowSchema',
        'visualiserData'
      );

      const action = workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema,
        atmWorkflowSchemaDiff: visualiserData,
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
