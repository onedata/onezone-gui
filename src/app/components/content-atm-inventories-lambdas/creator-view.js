/**
 * Creates new lambda. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-lambdas/creator-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { getProperties } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-lambdas-creator-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.creatorView',

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
   * @type {Function}
   * @param {Models.AtmLambda} createdAtmLambda
   */
  onAtmLambdaAdded: notImplementedIgnore,

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    async onFormSubmit(rawAtmLambda) {
      const {
        workflowActions,
        atmInventory,
        onAtmLambdaAdded,
      } = this.getProperties(
        'workflowActions',
        'atmInventory',
        'onAtmLambdaAdded'
      );

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
        onAtmLambdaAdded(record);
      } else {
        throw error;
      }
    },
  },
});
