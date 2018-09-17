/**
 * Container for one or many privilege models (depends on griArray and
 * sumPrivileges properties). Allows to automatically fetch/save data and manage
 * modification state of the privileges to deal with privilege editors.
 * 
 * Modification detection does not depend on real model values. Snapshot of model
 * is used to compare and detect changes to prevent from unpredictable behavior
 * during some model dynamic update.
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
 * * reloadModels() - loads/reloads privilege models from server (also updates
 *     snapshot),
 * * updateSnapshot() - updates privileges snapshot if model changed outside
 *     reloadModels,
 * * resetModifications() - resets state of modified privileges. Also calls
 *     updateSnapshot() to refresh state,
 * * setNewPrivileges() - takes modified privileges as an argument to remember
 *     modification state,
 * * save() - saves modifications.
 *
 * @module utils/privilege-model-proxy
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
   * If true, all privileges from all models will be merged into one privileges
   * object. Otherwise only first model privileges will be used.
   * @type {boolean}
   */
  sumPrivileges: false,

  /**
   * Optional model related to privileges.
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
   * True if models has been loaded at least once
   * @type {boolean}
   */
  hasBeenLoaded: false,

  /**
   * Array of fetched privilege models
   * @type {PromiseArray<Privilege>}
   */
  models: null,

  /**
   * Contains error, which occurred while fetching models, or null.
   * @type {*}
   */
  fetchError: computed(
    'models.{reason,content.@each.isForbidden}',
    function fetchError() {
      const models = this.get('models');
      let reason = get(models, 'reason');
      if (reason) {
        return reason;
      } else {
        const forbiddenModel = (get(models, 'content') || []).findBy('isForbidden');
        return get(forbiddenModel || {}, 'forbiddenError');
      }
    }
  ),

  /**
   * If true then at least one model is loading
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoading: reads('models.isPending'),

  /**
   * If true then all models are loaded
   * @type {boolean}
   */
  isLoaded: reads('models.isFulfilled'),

  /**
   * Array of privilege objects extracted from models
   * @type {Ember.ComputedProperty<Ember.A<Object>>}
   */
  persistedPrivileges: computed(
    'isLoaded',
    'models.content.@each.privileges',
    function persistedPrivileges() {
      const {
        isLoaded,
        models,
        groupedPrivilegesFlags,
      } = this.getProperties('isLoaded', 'models', 'groupedPrivilegesFlags');
      return isLoaded ? A(models.map(model =>
        privilegesArrayToObject(get(model, 'privileges'), groupedPrivilegesFlags)
      )) : A();
    }
  ),

  /**
   * Privileges used to calculate modification state
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
   * Reloads all models according to specified griArray
   * @returns {PromiseArray<Privilege>}
   */
  reloadModels() {
    const promiseArray = PromiseArray.create({
      promise: Promise.all(this.get('griArray').map(gri =>
        this.get('store').findRecord('privilege', gri, { reload: true })
      )),
    });
    this.set('models', promiseArray);
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
      .map(modelPriviletes => _.cloneDeep(modelPriviletes));
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
   * @param {boolean} reloadModels if true, models will be reloaded after save
   * @returns {Promise}
   */
  save(reloadModels = false) {
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
      promise = Promise.all(this.get('models.content').map((model, index) => {
          const diff = this.getPrivilegesModificationDiff(
            persistedPrivilegesSnapshot.objectAt(index)
          );
          if (!get(diff, 'grant.length') && !get(diff, 'revoke.length')) {
            return resolve();
          } else {
            const gri = get(model, 'gri');
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
        if (reloadModels) {
          return this.reloadModels();
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

    const isModified = !Object.keys(snapshot).reduce((isEqual, groupName) => {
      return Object.keys(snapshot[groupName]).reduce((isEq, privName) => {
        return isEq &&
          snapshot[groupName][privName] ===
          newValues[groupName][privName];
      }, isEqual);
    }, true);
    this.set('isModified', isModified);
  },

  /**
   * Merges all permissions from given objects creating a new privileges object
   * @param {Array<Object>} objects
   * @returns {Object}
   */
  mergePrivilegeObjects(objects) {
    const groupedPrivilegesFlags = this.get('groupedPrivilegesFlags');
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
