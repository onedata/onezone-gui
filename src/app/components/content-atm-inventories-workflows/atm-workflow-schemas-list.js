/**
 * Shows list of workflow schemas (passed via `collection` property).
 *
 * @module components/content-atm-inventories-workflows/atm-workflow-schemas-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { sort } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  classNames: ['atm-workflow-schemas-list'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.atmWorkflowSchemasList',

  /**
   * @virtual
   * @type {Array<Models.AtmWorkflowSchema>}
   */
  collection: undefined,

  /**
   * @virtual
   * @type {(atmWorkflowSchema: Models.AtmWorkflowSchema, revisionNumber: RevisionNumber) => void}
   */
  onRevisionClick: undefined,

  /**
   * @virtual
   * @type {(atmWorkflowSchema: Models.AtmWorkflowSchema, createdRevisionNumber: RevisionNumber) => void}
   */
  onRevisionCreated: undefined,

  /**
   * @type {String}
   */
  searchValue: '',

  /**
   * @type {Array<String>}
   */
  collectionOrder: Object.freeze(['name']),

  /**
   * @type {ComputedProperty<Array<Models.AtmWorkflowSchema>>}
   */
  filteredCollection: computed(
    'searchValue',
    'collection.@each.{name,isLoaded}',
    function filteredCollection() {
      const {
        collection,
        searchValue,
      } = this.getProperties('collection', 'searchValue');
      const normalizedSearchValue = searchValue.trim().toLowerCase();

      return (collection || []).filter(atmWorkflowSchema => {
        const {
          isLoaded,
          name,
        } = getProperties(atmWorkflowSchema, 'isLoaded', 'name');
        if (!isLoaded) {
          return false;
        }
        const normalizedName = (name || '').trim().toLowerCase();
        return normalizedName.includes(normalizedSearchValue);
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Models.AtmWorkflowSchema>>}
   */
  sortedCollection: sort('filteredCollection', 'collectionOrder'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this, 'set', 'searchValue', newValue, typingActionDebouce);
    },
  },
});
