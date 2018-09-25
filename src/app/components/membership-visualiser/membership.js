import Component from '@ember/component';
import { computed, get } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { Promise } from 'rsvp';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import MembershipRelation from 'onedata-gui-websocket-client/utils/membership-relation';

export default Component.extend(RecognizerMixin, {
  classNames: ['membership'],
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
   * @type {Ember.ComputedProperty<PromiseArray<Array<GraphSingleModel>>>}
   */
  recordsProxy: computed('path.griPath', function recordsProxy() {
    return PromiseArray.create({
      promise: Promise.all(
        this.get('path.griPath').map(recordGri => this.fetchRecordByGri(recordGri)),
      ),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  pathElements: computed('recordsProxy.isFulfilled', function pathElements() {
    const {
      recordsProxy,
      pathStart,
    } = this.getProperties('recordsProxy', 'pathStart');
    if (get(recordsProxy, 'isFulfilled')) {
      let prevBlock = pathStart;
      const elements = [{
        id: 'block|' + get(pathStart, 'gri'),
        type: 'block',
        startBlock: true,
        record: pathStart,
      }];
      recordsProxy.forEach(block => {
        elements.push({
          id: `relation|${get(prevBlock, 'gri')}|${get(block, 'gri')}`,
          type: 'relation',
          relation: MembershipRelation.create({
            parent: block,
            child: prevBlock,
          }),
        }, {
          id: 'block|' + get(block, 'gri'),
          type: 'block',
          record: block,
        });
        prevBlock = block;
      });
      return elements;
    } else {
      return [];
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
