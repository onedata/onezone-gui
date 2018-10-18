/**
 * Container for one or many privilege records (depends on griArray and
 * sumPrivileges properties). Allows to automatically fetch/save data and manage
 * modification state of the privileges to deal with privilege editors.
 * 
 * Modification detection does not depend on real record values. Snapshot of record
 * is used to compare and detect changes to prevent from unpredictable behavior
 * during some record dynamic update.
 * 
 * Internally (and also through setNewPrivileges method) privileges are stored using
 * object representation. All privileges are grouped under corresponding keys according
 * to the groupedPrivilegesFlags property:
 * ```
 * {
 *   categoryName1: {
 *     privilege1: true/false,
 *     privilege2: true/false,
 *   },
 *   categoryName2: {
 *    privilege3: true/false,
 *   }
 *   //...
 * }
 * ```
 * 
 * Important methods:
 * * reloadRecords() - loads/reloads privilege records from server (also updates
 *     snapshot),
 * * updateSnapshot() - updates privileges snapshot if records changed outside
 *     reloadRecords,
 * * resetModifications() - resets state of modified privileges. Also calls
 *     updateSnapshot() to refresh state,
 * * setNewPrivileges() - takes modified privileges as an argument to remember
 *     modification state,
 * * save() - saves modifications.
 *
 * @module utils/privilege-record-proxy
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { A } from '@ember/array';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { Promise, resolve } from 'rsvp';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';
import _ from 'lodash';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';

/**
 * @typedef {Object} PrivilegeDiff
 * @property {Array<string>} grant privileges to add
 * @property {Array<string>} revoke privileges to remove
 */

export default EmberObject.extend({
  store: service(),
  onedataGraph: service(),

  /**
   * Array of privilege GRI
   * @type {Array<string>}
   * @virtual
   */
  griArray: Object.freeze([]),

  /**
   * Grouped privileges used to construct objects with privileges
   * @type {Array<Object>}
   * @virtual
   */
  groupedPrivilegesFlags: null,

  /**
   * If true, all privileges from all records will be merged into one privileges
   * object. Otherwise only first record privileges will be used.
   * @type {boolean}
   */
  sumPrivileges: false,

  /**
   * Optional record related to privileges.
   * @type {GraphModel|null}
   */
  subject: null,

  /**
   * Represents "actual constat state" of the privileges from some point of time.
   * Is will be used as a base to calculate modifications.
   * @type {Object}
   */
  persistedPrivilegesSnapshot: Object.freeze([]),

  /**
   * Privileges object used to store actual state of privileges modification.
   * Should be modified using setNewPrivileges method.
   * @type {Object}
   */
  modifiedPrivileges: Object.freeze({}),

  /**
   * If true, then modifiedPrivileges differ from effectivePrivilegesSnapshot.
   * Recalculated by updateModificationState method.
   * @type {boolean}
   */
  isModified: false,

  /**
   * @type {boolean}
   */
  isSaving: false,

  /**
   * True if records has been loaded at least once
   * @type {boolean}
   */
  hasBeenLoaded: false,

  /**
   * Array of fetched privilege records
   * @type {PromiseArray<Privilege>}
   */
  records: null,

  /**
   * Contains error, which occurred while fetching records, or null.
   * @type {*}
   */
  fetchError: computed(
    'records.{reason,content.@each.isForbidden}',
    function fetchError() {
      const records = this.get('records') || {};
      let reason = get(records, 'reason');
      if (reason) {
        return reason;
      } else {
        const forbiddenRecord =
          (get(records, 'content') || []).findBy('isForbidden');
        return get(forbiddenRecord || {}, 'forbiddenError');
      }
    }
  ),

  /**
   * If true then at least one record is loading
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoading: reads('records.isPending'),

  /**
   * If true then all records are loaded
   * @type {boolean}
   */
  isLoaded: reads('records.isFulfilled'),

  /**
   * Array of privilege objects extracted from records
   * @type {Ember.ComputedProperty<Ember.A<Object>>}
   */
  persistedPrivileges: computed(
    'isLoaded',
    'records.content.@each.privileges',
    function persistedPrivileges() {
      const {
        isLoaded,
        records,
        groupedPrivilegesFlags,
      } = this.getProperties('isLoaded', 'records', 'groupedPrivilegesFlags');
      return isLoaded ? A(records.map(record =>
        privilegesArrayToObject(get(record, 'privileges'), groupedPrivilegesFlags)
      )) : A();
    }
  ),

  /**
   * Privileges used to calculate modification state. Each privilege can have
   * 3 possible values: true, false and 2. 2 means, that some of privilege
   * records does not have this permission and some of them does
   * (combined true and false values).
   * @type {Ember.ComputedProperty<Object>}
   */
  effectivePrivilegesSnapshot: computed(
    'persistedPrivilegesSnapshot.[]',
    'sumPrivileges',
    function effectivePrivilegesSnapshot() {
      const {
        persistedPrivilegesSnapshot,
        sumPrivileges,
      } = this.getProperties('persistedPrivilegesSnapshot', 'sumPrivileges');
      if (!get(persistedPrivilegesSnapshot, 'length')) {
        return null;
      } else if (!sumPrivileges) {
        return persistedPrivilegesSnapshot.objectAt(0);
      } else {
        return this.mergePrivilegeObjects(persistedPrivilegesSnapshot);
      }
    }
  ),

  isLoadedObserver: observer('isLoaded', function isLoadedObserver() {
    if (this.get('isLoaded') && !this.get('hasBeenLoaded')) {
      this.set('hasBeenLoaded', true);
    }
  }),

  changesObserver: observer(
    'isModified',
    'persistedPrivileges',
    function isLoadedObserver() {
      if (!this.get('isModified')) {
        this.updateSnapshot();
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.isLoadedObserver();
  },

  /**
   * Reloads all records according to specified griArray
   * @returns {PromiseArray<Privilege>}
   */
  reloadRecords() {
    const promiseArray = PromiseArray.create({
      promise: Promise.all(this.get('griArray').map(gri =>
        this.get('store').findRecord('privilege', gri, { reload: true })
      )),
    });
    this.set('records', promiseArray);
    promiseArray.then(() => {
      safeExec(this, 'resetModifications');
    });
    return promiseArray;
  },

  /**
   * Sets privilegesSnapshot to persisted privileges
   * @return {undefined}
   */
  updateSnapshot() {
    const copy = this.get('persistedPrivileges')
      .map(recordPrivileges => _.cloneDeep(recordPrivileges));
    this.set('persistedPrivilegesSnapshot', copy);
  },

  /**
   * Sets modifiedPrivileges to actual privileges snapshot
   * @return {undefined}
   */
  resetModifications() {
    this.updateSnapshot();
    this.setNewPrivileges(this.get('effectivePrivilegesSnapshot'));
  },

  /**
   * Updates modifiedPrivileges using newValues
   * @param {Object} newValues
   * @returns {undefined}
   */
  setNewPrivileges(newValues) {
    this.set('modifiedPrivileges', _.cloneDeep(newValues));
    this.updateModificationState();
  },

  /**
   * Saves modifications
   * @param {boolean} reloadRecords if true, records will be reloaded after save
   * @returns {Promise}
   */
  save(reloadRecords = false) {
    let promise;
    if (!this.get('isModified')) {
      promise = resolve();
    } else {
      this.set('isSaving', true);
      const {
        persistedPrivilegesSnapshot,
        onedataGraph,
      } = this.getProperties(
        'persistedPrivilegesSnapshot',
        'onedataGraph'
      );
      promise = Promise.all(this.get('records.content').map((record, index) => {
          const diff = this.getPrivilegesModificationDiff(
            persistedPrivilegesSnapshot.objectAt(index)
          );
          if (!get(diff, 'grant.length') && !get(diff, 'revoke.length')) {
            return resolve();
          } else {
            const gri = get(record, 'gri');
            return onedataGraph.request({
              gri,
              operation: 'update',
              data: diff,
            });
          }
        }))
        .finally(() => {
          safeExec(this, 'set', 'isSaving', false);
        });
    }
    promise.then(() => {
      safeExec(this, () => {
        if (reloadRecords) {
          return this.reloadRecords();
        }
      });
    });
    return promise;
  },

  /**
   * Checks if modifiedPrivileges differs from effectivePrivilegesSnapshot and
   * sets isModified flag.
   * @returns {undefined}
   */
  updateModificationState() {
    const {
      effectivePrivilegesSnapshot: snapshot,
      modifiedPrivileges: newValues,
    } = this.getProperties('effectivePrivilegesSnapshot', 'modifiedPrivileges');
    this.set('isModified', !_.isEqual(snapshot, newValues));
  },

  /**
   * Merges all permissions from given objects creating a new privileges object
   * @param {Array<Object>} objects Object compatible with
   *   `privilegesArrayToObject` function result.
   * @returns {Object} Object, which format is compatible with `object` items and
   *   `privilegesArrayToObject` function result.
   */
  mergePrivilegeObjects(objects) {
    const groupedPrivilegesFlags = this.get('groupedPrivilegesFlags');
    /** @type {Object} mapping without grouping:
     *    privilegeName (string) -> true|false|2
     */
    const privilegesFlatTree = {};
    objects.forEach(privilegeObject => {
      const privileges = _.assign({}, ..._.values(privilegeObject));
      Object.keys(privileges).forEach(privName => {
        if (privilegesFlatTree[privName] === undefined) {
          privilegesFlatTree[privName] = privileges[privName];
        } else if (privilegesFlatTree[privName] !== privileges[privName]) {
          // toggle middle state
          privilegesFlatTree[privName] = 2;
        }
      });
    });
    return groupedPrivilegesFlags.reduce((tree, group) => {
      tree[group.groupName] = group.privileges.reduce((subtree, priv) => {
        subtree[priv] = privilegesFlatTree[priv];
        return subtree;
      }, {});
      return tree;
    }, {});
  },

  /**
   * Calculates privileges diff between passed prevPrivileges and
   * modifiedPrivileges
   * @param {Object} prevPrivileges 
   * @return {PrivilegeDiff}
   */
  getPrivilegesModificationDiff(prevPrivileges) {
    const modifiedPrivileges = this.get('modifiedPrivileges');
    const grant = [];
    const revoke = [];
    Object.keys(modifiedPrivileges).forEach(groupName =>
      Object.keys(modifiedPrivileges[groupName]).forEach(privName => {
        const oldValue = prevPrivileges[groupName][privName];
        const newValue = modifiedPrivileges[groupName][privName];
        if (newValue !== 2 && newValue !== oldValue) {
          (newValue ? grant : revoke).push(privName);
        }
      })
    );
    return {
      grant,
      revoke,
    };
  },
});
