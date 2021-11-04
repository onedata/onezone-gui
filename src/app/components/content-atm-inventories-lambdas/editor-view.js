/**
 * Creates new lambda. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-lambdas/editor-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { getProperties } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { getBy } from 'ember-awesome-macros';

const viewTypeToFormModeMap = {
  editor: 'edit',
  creator: 'create',
  preview: 'view',
};

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-lambdas-editor-view'],

  i18n: service(),
  workflowActions: service(),
  onedataConnection: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.editorView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  atmLambdaRevisionNumber: undefined,

  /**
   * @virtual
   * @type {AtmLambdaRevision}
   */
  atmLambdaRevision: undefined,

  /**
   * One of `'editor'`, `'creator'`, `'preview'`
   * @virtual
   * @type {String}
   */
  viewType: undefined,

  /**
   * @type {Object<string,string>}
   */
  viewTypeToFormModeMap,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @type {Function}
   * @param {Models.AtmLambda} createdAtmLambda
   */
  onAtmLambdaRevisionSaved: notImplementedIgnore,

  /**
   * @type {ComputedProperty<string>}
   */
  formMode: getBy('viewTypeToFormModeMap', 'viewType'),

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    async onFormSubmit(rawAtmLambda) {
      const {
        workflowActions,
        atmInventory,
        onAtmLambdaRevisionSaved,
      } = this.getProperties(
        'workflowActions',
        'atmInventory',
        'onAtmLambdaRevisionSaved'
      );

      console.log(rawAtmLambda);

      const action = workflowActions.createCreateAtmLambdaAction({
        atmInventory,
        rawAtmLambda,
      });
      const result = await action.execute();

      const {
        status,
        result: record,
        error,
      } = getProperties(result, 'status', 'result', 'error');
      if (status === 'done') {
        onAtmLambdaRevisionSaved(record);
      } else {
        throw error;
      }
    },
  },
});
