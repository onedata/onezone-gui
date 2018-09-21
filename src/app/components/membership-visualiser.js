import Component from '@ember/component';
import { computed, get, getProperties } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import gri from 'onedata-gui-websocket-client/utils/gri';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { resolve, Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

/**
 * @typedef {Object} MembershipPath
 * @property {string} id
 * @property {Array<string>} griPath array of GRIs
 */

export default Component.extend(I18n, {
  classNames: ['membership-visualiser'],

  store: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.relationship-visualiser',

  /**
   * User or group
   * @type {User|Group}
   * @virtual
   */
  contextRecord: null,

  /**
   * Group, space or privider
   * @type {Group|Space|Provider}
   * @virtual
   */
  targetRecord: null,

  /**
   * @type {number}
   */
  maxPathsNumber: 5,

  /**
   * @type {Ember.ComputedProperty<Ember.A>}
   */
  paths: computed(function paths() {
    return A();
  }),

  init() {
    this._super(...arguments);
    this.fetchMembership(this.getMembershipGri(this.get('targetRecord.gri')), true)
      .then(rootMembership => safeExec(this, () => {
        this.set('rootMembership', rootMembership);
        return this.findPaths();
      }))
      .then((p) => this.set('paths', p));
  },

  getMembershipGri(modelGri) {
    const {
      entityType,
      entityId,
    } = getProperties(this.get('contextRecord'), 'entityType', 'entityId');
    return gri(_.assign(parseGri(modelGri), {
      aspect: `eff_${entityType}_membership`,
      aspectId: entityId,
      scope: 'private',
    }));
  },

  fetchMembership(membershipGri, forceReload) {
    const store = this.get('store');
    const loadedRecord = store.peekRecord('membership', membershipGri);
    if (forceReload || !loadedRecord) {
      return store.findRecord('membership', membershipGri, { reload: true });
    } else {
      return resolve(loadedRecord);
    }
  },

  fetchGraphLevel(parentLevel, nodeParents, allNodes) {
    const newLevel = [];
    parentLevel.forEach(parentMembership => {
      get(parentMembership, 'intermediaries').forEach(itermediaryGri => {
        const intermediaryParents = nodeParents.get(itermediaryGri) || [];
        if (!intermediaryParents.includes(parentMembership)) {
          intermediaryParents.push(parentMembership);
          nodeParents.set(itermediaryGri, intermediaryParents);
          const membershipGri = this.getMembershipGri(itermediaryGri);
          const promise = this.fetchMembership(membershipGri, !allNodes.has(itermediaryGri))
            .then(membership => {
              allNodes.set(itermediaryGri, membership);
              return membership;
            });
          newLevel.push(promise);
        }
      });
    });
    return Promise.all(newLevel);
  },

  findPaths() {
    const allNodes = new Map();
    const rootNode = this.get('rootMembership');
    allNodes.set(this.get('targetRecord.gri'), rootNode);
    return this.findPathsForDeeperLevel(
      [rootNode],
      allNodes,
      new Map()
    ).then(paths => paths.map(path => ({
      id: path.join('|'),
      griPath: path,
    })));
  },

  findPathsForDeeperLevel(parentLevel, allNodes, nodeParents) {
    const maxPathsNumber = this.get('maxPathsNumber');
    return this.fetchGraphLevel(parentLevel, nodeParents, allNodes)
      .then(childLevel => {
        const paths = this.calculatePaths(allNodes, maxPathsNumber);
        if (paths.length >= maxPathsNumber || childLevel.length === 0) {
          return paths.slice(0, maxPathsNumber);
        }
        else {
          return this.findPathsForDeeperLevel(
            childLevel,
            allNodes,
            nodeParents
          );
        }
      });
  },

  calculatePaths(allNodes, limit) {
    const donePaths = [];
    let workingPaths = [
      [this.get('targetRecord.gri')],
    ];
    while (donePaths.length < limit && workingPaths.length > 0) {
      workingPaths = _.flatten(workingPaths.map(workingPath => {
        const lastNodeGri = workingPath[workingPath.length - 1];
        const lastNode = allNodes.get(lastNodeGri);
        if (!lastNode) {
          // node has not been fetched yet
          return [];
        }
        if (get(lastNode, 'directMembership')) {
          donePaths.push(workingPath.slice(0).reverse());
        }
        return get(lastNode, 'intermediaries')
          .filter(intermediaryGri => !workingPath.includes(intermediaryGri))
          .map(intermediaryGri => workingPath.concat([intermediaryGri]));
      }));
    }
    return donePaths;
  },
});
