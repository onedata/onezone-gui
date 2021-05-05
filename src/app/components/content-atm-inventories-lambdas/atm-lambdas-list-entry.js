/**
 * Shows single lambda.
 *
 * @module components/content-atm-inventories-lambdas/atm-lambdas-list-entry
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['atm-lambdas-list-entry'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.atmLambdasListEntry',

  /**
   * @virtual
   * @type {Models.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @type {Boolean}
   */
  isExpanded: false,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  toggleDetailsText: conditional(
    'isExpanded',
    computedT('hideDetails'),
    computedT('showDetails'),
  ),

  actions: {
    toggleDetails() {
      this.toggleProperty('isExpanded');
    },
  },
});
