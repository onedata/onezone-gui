import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { Promise } from 'rsvp';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import MembershipRelation from 'onedata-gui-websocket-client/utils/membership-relation';

export default Component.extend(RecognizerMixin, {
  classNames: ['membership', 'collapse-animation', 'collapse-medium'],
  classNameBindings: ['isFilteredOut:collapse-hidden'],
  recognizers: 'pan',

  store: service(),

  /**
   * @type {User|Group}
   * @virtual
   */
  pathStart: null,

  /**
   * @type {MembershipPath}
   * @virtual
   */
  path: null,

  /**
   * @type {string}
   * @virtual
   */
  searchString: '',

  /**
   * Max number of blocks, that will be rendered in membership path.
   * 0 means no limit.
   * @type {number}
   */
  visibleBlocks: 0,

  /**
   * Redirects to record dedicated page
   * @type {Function}
   * @virtual
   * @param {GraphSingleModel} record
   * @returns {undefined}
   */
  view: notImplementedThrow,

  /**
   * Shows privileges editor
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,

  /**
   * Horizontal scroll state stored on pan gesture start
   * @type {number}
   */
  panStartScrollX: 0,

  /**
   * @type {string}
   */
  lastFetchedPathId: null,

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Array<GraphSingleModel>>>}
   */
  recordsProxy: null,

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  pathElements: computed(
    'recordsProxy.isFulfilled',
    'visibleBlocks',
    function pathElements() {
      const {
        recordsProxy,
        pathStart,
        visibleBlocks,
      } = this.getProperties('recordsProxy', 'pathStart', 'visibleBlocks');
      if (get(recordsProxy, 'isFulfilled')) {
        const reversedRecords =
          [pathStart].concat(get(recordsProxy, 'content')).reverse();
        const blocks = [];
        while (
          (get(blocks, 'length') < visibleBlocks || visibleBlocks === 0) &&
          get(reversedRecords, 'length') > 0
        ) {
          const blocksLength = get(blocks, 'length');
          const reversedRecordsLength = get(reversedRecords, 'length');
          if (blocksLength === visibleBlocks - 1 && reversedRecordsLength > 1) {
            blocks.unshift({
              id: 'more',
              type: 'more',
              number: reversedRecordsLength,
            });
          } else {
            const record = reversedRecords.shift();
            blocks.unshift({
              id: 'block|' + get(record, 'gri'),
              type: 'block',
              record,
              startBlock: reversedRecordsLength === 1,
            });
          }
        }
        let prevBlock = blocks[0];
        const elements = [blocks[0]];
        blocks.slice(1).forEach(block => {
          const isPrevMore = get(prevBlock, 'type') === 'more';
          elements.push({
            id: `relation|${isPrevMore ? 'more' : get(prevBlock, 'record.gri')}|${get(block, 'record.gri')}`,
            type: 'relation',
            relation: isPrevMore ? null : MembershipRelation.create({
              parent: get(block, 'record'),
              child: get(prevBlock, 'record'),
            }),
          }, block);
          prevBlock = block;
        });
        return elements;
      } else {
        return [];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFilteredOut: computed(
    'searchString',
    'recordsProxy.@each.name',
    function isFilteredOut() {
      const {
        searchString,
        recordsProxy,
      } = this.getProperties('searchString', 'recordsProxy');
      if (!get(recordsProxy, 'isFulfilled')) {
        return false;
      } else {
        const names = recordsProxy.mapBy('name');
        const query = (searchString || '').toLowerCase();
        return names.every(name => !name.toLowerCase().includes(query));
      }
    }
  ),

  pathIdObserver: observer('path.id', function pathIdObserver() {
    const pathId = this.get('path.id');
    if (this.get('lastFetchedPathId') !== pathId) {
      this.setProperties({
        lastFetchedPathId: pathId,
        recordsProxy: PromiseArray.create({
          promise: Promise.all(
            this.get('path.griPath').map(recordGri => this.fetchRecordByGri(recordGri)),
          ),
        }),
      });
    }
  }),

  panStart() {
    const scrollContainer = this.getScrollContainer();
    if (scrollContainer) {
      this.set('panStartScrollX', scrollContainer.scrollLeft());
    }
  },

  panMove(event) {
    const panStartScrollX = this.get('panStartScrollX');
    const scrollContainer = this.getScrollContainer();
    if (scrollContainer) {
      scrollContainer.scrollLeft(panStartScrollX - event.originalEvent.gesture.deltaX);
    }
  },

  init() {
    this._super(...arguments);
    this.pathIdObserver();
  },
  
  /**
   * Loads record using given GRI
   * @param {string} recordGri 
   * @returns {Promise<GraphSingleModel>}
   */
  fetchRecordByGri(recordGri) {
    const entityType = parseGri(recordGri).entityType;
    return this.get('store').findRecord(entityType, recordGri)
      .then(record => Promise.all([
        record.get('groupList'),
        record.get('userList'),
      ]).then(() => record));
  },

  getScrollContainer() {
    return this.$().children('.ps-container');
  },
});
