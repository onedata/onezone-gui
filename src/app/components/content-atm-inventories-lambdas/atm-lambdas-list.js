/**
 * Shows list of lambdas (passed via `collection` property).
 * Works in two modes:
 * - `'presentation'` - shows list of lambdas, allows name/description modification
 * - `'selection'` - shows list of lambdas, allows to select lambda to use it
 *     in workflow and shows lambdas from other inventories, does not allow any
 *     modifications.
 *
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
import { tag, conditional, eq, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  classNames: ['atm-lambdas-list'],
  classNameBindings: [
    'searchValue:filtered-list',
    'modeClass',
  ],

  i18n: service(),

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
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onAddToAtmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onRevisionClick: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, originRevisionNumber: RevisionNumber) => void}
   */
  onRevisionCreate: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onRevisionCreated: undefined,

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
  collectionOrder: Object.freeze(['latestRevision.name']),

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
    'activeCollection.@each.{latestRevision,isLoaded}',
    function filteredCollection() {
      const {
        activeCollection,
        searchValue,
      } = this.getProperties('activeCollection', 'searchValue');
      const normalizedSearchValue = searchValue.trim().toLowerCase();

      return (activeCollection || []).filter(atmLambda => {
        const isLoaded = get(atmLambda, 'isLoaded');
        if (!isLoaded) {
          return false;
        }
        const name = get(atmLambda, 'latestRevision.name');
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
  },
});
