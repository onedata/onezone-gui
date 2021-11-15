/**
 * Creates/modifies workflow task. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-workflows/task-details-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed, trySet } from '@ember/object';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-workflows-task-details-view'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.taskDetailsView',

  /**
   * One of: `'create'`, `'edit'`
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {Models.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  revisionNumber: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  stores: undefined,

  /**
   * Needed when `mode` is `'edit'
   * @virtual optional
   * @type {Object}
   */
  task: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isShown: false,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onCancel: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Object} taskProps
   * @returns {Promise}
   */
  onApplyChanges: notImplementedIgnore,

  /**
   * @type {Boolean}
   */
  isSubmittingData: false,

  /**
   * New task data, that should be persisted on submit click. Yielded
   * by the form.
   * @type {Object}
   */
  dataToSubmit: undefined,

  /**
   * If true, then `dataToSubmit` contains valid data.
   * @type {Boolean}
   */
  isDataValid: true,

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: computed('mode', function headerText() {
    return this.t(`header.${this.get('mode')}`, {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  submitBtnText: computed('mode', function headerText() {
    return this.t(`buttons.submit.${this.get('mode')}`, {}, { defaultValue: '' });
  }),

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    formDataChanged({ data, isValid }) {
      this.setProperties({
        dataToSubmit: isValid ? data : undefined,
        isDataValid: isValid,
      });
    },
    cancel() {
      this.get('onCancel')();
    },
    async submit() {
      this.set('isSubmittingData', true);
      const {
        dataToSubmit,
        onApplyChanges,
      } = this.getProperties('dataToSubmit', 'onApplyChanges');

      try {
        await onApplyChanges(dataToSubmit);
      } finally {
        trySet(this, 'isSubmittingData', false);
      }
    },
  },
});
