import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { sort } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

const isInTestingEnv = config.environment === 'test';

export default Component.extend({
  classNames: ['atm-workflow-schemas-list'],

  /**
   * @virtual
   * @type {Array<Models.AtmWorkflowSchema>}
   */
  collection: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.AtmWorkflowSchema}
   * @returns {any}
   */
  onAtmWorkflowSchemaClick: notImplementedIgnore,

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
    'collection.@each.name',
    function filteredCollection() {
      const {
        collection,
        searchValue,
      } = this.getProperties('collection', 'searchValue');
      const normalizedSearchValue = searchValue.trim().toLowerCase();

      return (collection || []).filter(atmWorkflowSchema => {
        const normalizedName = get(atmWorkflowSchema, 'name').trim().toLowerCase();
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
      debounce(this, 'set', 'searchValue', newValue, isInTestingEnv ? 1 : 300);
    },
  },
});
