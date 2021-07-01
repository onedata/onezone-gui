/**
 * Creates new workflow schema. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-workflows/creator-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { getProperties, trySet } from '@ember/object';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-workflows-creator-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.creatorView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Array<Utils.Action>} actions
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.AtmWorkflowSchema} createdAtmWorkflowSchema
   */
  onAtmWorkflowSchemaAdded: notImplementedIgnore,

  /**
   * @type {Object}
   */
  newAtmWorkflowSchemaData: undefined,

  /**
   * @type {Boolean}
   */
  isNewAtmWorkflowSchemaDataValid: false,

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  init() {
    this._super(...arguments);
    this.get('onRegisterViewActions')([]);
  },

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    detailsChanged({ data, isValid }) {
      this.setProperties({
        newAtmWorkflowSchemaData: isValid ? data : undefined,
        isNewAtmWorkflowSchemaDataValid: isValid,
      });
    },
    async submit() {
      this.set('isSubmitting', true);
      const {
        workflowActions,
        atmInventory,
        onAtmWorkflowSchemaAdded,
        newAtmWorkflowSchemaData,
      } = this.getProperties(
        'workflowActions',
        'atmInventory',
        'onAtmWorkflowSchemaAdded',
        'newAtmWorkflowSchemaData'
      );

      const action = workflowActions.createCreateAtmWorkflowSchemaAction({
        atmInventory,
        rawAtmWorkflowSchema: newAtmWorkflowSchemaData,
      });
      const result = await action.execute();
      trySet(this, 'isSubmitting', false);

      const {
        status,
        result: record,
        error,
      } = getProperties(result, 'status', 'result', 'error');
      if (status === 'done') {
        onAtmWorkflowSchemaAdded(record);
      } else {
        throw error;
      }
    },
  },
});
