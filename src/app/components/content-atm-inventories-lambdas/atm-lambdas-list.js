/**
 * Shows list of lambdas (passed via `collection` property).
 *
 * @module components/content-atm-inventories-lambdas/atm-lambdas-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { sort } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import { tag } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  classNames: ['atm-lambdas-list'],
  classNameBindings: [
    'searchValue:filtered-list',
    'modeClass',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.atmLambdasList',

  /**
   * @virtual
   * @type {Array<Models.AtmLambda>}
   */
  collection: undefined,

  /**
   * One of: `'presentation'`, `'selection'`
   * @virtual optional
   * @type {String}
   */
  mode: 'presentation',

  /**
   * Needed when `mode` is `'selection'`
   * @virtual optional
   * @type {Function}
   * @param {Model.AtmLambda}
   * @returns {any}
   */
  onAddToAtmWorkflowSchema: notImplementedIgnore,

  /**
   * @type {String}
   */
  searchValue: '',

  /**
   * @type {Array<String>}
   */
  collectionOrder: Object.freeze(['name']),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Array<Models.AtmLambda>>}
   */
  filteredCollection: computed(
    'searchValue',
    'collection.@each.name',
    function filteredCollection() {
      const {
        collection,
        searchValue,
      } = this.getProperties('collection', 'searchValue');
      const normalizedSearchValue = searchValue.trim().toLowerCase();

      return (collection || []).filter(atmLambda => {
        const normalizedName = get(atmLambda, 'name').trim().toLowerCase();
        return normalizedName.includes(normalizedSearchValue);
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Models.AtmLambda>>}
   */
  sortedCollection: sort('filteredCollection', 'collectionOrder'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this, 'set', 'searchValue', newValue, typingActionDebouce);
    },
    onAddToAtmWorkflowSchema(atmLambda) {
      this.get('onAddToAtmWorkflowSchema')(atmLambda);
    },
  },
});
