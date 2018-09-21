import Component from '@ember/component';
import { computed, get } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { Promise } from 'rsvp';

export default Component.extend({
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
          parent: block,
          child: prevBlock,
        }, {
          id: 'block|' + get(block, 'gri'),
          type: 'block',
          record: block,
        });
      });
      return elements;
    } else {
      return [];
    }
  }),

  /**
   * Loads record using given GRI
   * @param {string} recordGri 
   * @returns {Promise<GraphSingleModel>}
   */
  fetchRecordByGri(recordGri) {
    const entityType = parseGri(recordGri).entityType;
    return this.get('store').findRecord(entityType, recordGri);
  },
});
