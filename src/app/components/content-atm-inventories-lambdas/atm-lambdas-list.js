/**
 * Shows list of lambdas (passed via `collection` property).
 * Works in two modes:
 * - `'presentation'` - shows list of lambdas, allows name/description modification
 * - `'selection'` - shows list of lambdas, allows to select lambda to use it
 *     in workflow and shows lambdas from other inventories, does not allow any
 *     modifications.
 *
 * @module components/content-atm-inventories-lambdas/atm-lambdas-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, getProperties } from '@ember/object';
import { sort } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import { tag, conditional, eq, raw } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  classNames: ['atm-lambdas-list'],
  classNameBindings: [
    'searchValue:filtered-list',
    'modeClass',
  ],

  i18n: service(),
  media: service(),

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
   * Needed when `mode` is `'selection'`. Should contain all lambdas from all
   * inventories.
   * @virtual optional
   * @type {Array<Models.AtmLambda>}
   */
  allCollection: undefined,

  /**
   * Needed when `mode` is `'presentation'`.
   * @virtual optional
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

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
   * One of: `'thisInventory'`, `'all'`
   * @type {String}
   */
  activeCollectionType: 'thisInventory',

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
  activeCollection: conditional(
    eq('activeCollectionType', raw('all')),
    'allCollection',
    'collection'
  ),

  /**
   * @type {ComputedProperty<Array<Models.AtmLambda>>}
   */
  filteredCollection: computed(
    'searchValue',
    'activeCollection.@each.{name,isLoaded}',
    function filteredCollection() {
      const {
        activeCollection,
        searchValue,
      } = this.getProperties('activeCollection', 'searchValue');
      const normalizedSearchValue = searchValue.trim().toLowerCase();

      return (activeCollection || []).filter(atmLambda => {
        const {
          isLoaded,
          name,
        } = getProperties(atmLambda, 'isLoaded', 'name');
        if (!isLoaded) {
          return false;
        }
        const normalizedName = (name || '').trim().toLowerCase();
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
    addToAtmWorkflowSchema(atmLambda) {
      this.get('onAddToAtmWorkflowSchema')(atmLambda);
    },
  },
});
