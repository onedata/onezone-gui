/**
 * Generates actions for specific atm lambda revision.
 *
 * @module utils/atm-workflow/atm-lambda/revision-actions-factory
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/revision-actions-factory';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';

export default RevisionActionsFactory.extend(OwnerInjector, {
  workflowActions: service(),

  /**
   * @virtual
   * @type {Models.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @virtual optional
   * @type {(atmLambda: Models.AtmLambda, createdRevisionNumber: Number) => void)}
   */
  onRevisionCreated: undefined,

  /**
   * @override
   */
  createActionsForRevisionNumber(revisionNumber) {
    return [];
  },

  /**
   * @override
   */
  createCreateRevisionAction() {},
});
