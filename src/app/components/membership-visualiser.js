/**
 * A component that shows membership path from `contextRecord` to `targetRecord`.
 * Rendering options can be changed using fields `visibleBlocks`, `isCondensed` and
 * `maxPathsNumber`. Additional autogenerated descriptions are available, which can
 * be enabled through field `showDescription`.
 * 
 * The component uses two types of data loading. When it is first renedered and
 * initial data is being loaded, then non-silent mode is used - spinner is visible.
 * The second, silent type is used, when some relation data changes in
 * the background. In that case no spinner is visible.
 * 
 *  
 * Algorithm of path searching:
 * 
 * There are two types of records:
 *   * regular record - like space, group, user etc.
 *   * membership record - contains information about next regular record on
 *     membership path from some regular record to another regular record.
 *     It contains only direct members, which are "directions"
 *     where you need to go, to find some arbitrary record. Example:
 *     Lets suppose we have a membership:
 *     U1 (user) -> G1 (group) -> G2 (group) -> S1 (space).
 *     To find membership path between S1 and U1, we need to ask for the membership
 *     record (S1ID,U1ID). That record contains information {intermediaries: [G2ID]}.
 *     We know now, that to reach U1 from S1, we need to go through G2. Then we
 *     ask about membership record (G2ID,U1ID) and we receive
 *     {intermediaries: [G1ID]}. It means that to reach U1 from G2 we need to
 *     go through G1. So we ask about membership (G1ID,U1ID) an we receive
 *     {intermediaries:[],directMembership:true}. directMembership means that this is
 *     a possible end of the membership path, because U1 is a direct member of G1.
 *     At the end we know a sequence S1ID, G2ID, G1ID, U1ID, which is enough to
 *     build full membership path representation.
 *     Warning: even if membership for some record has directMembership:true, it
 *     can be still used to build longer paths (if intermediaries.length > 0).
 * 
 * According to the example above lets call U1 a contextRecord and S1 a targetRecord.
 * Our task is to find a path from the contextRecord to the targetRecord using
 * membership records, which will be requested starting from the targetRecord up to
 * the contextRecord. We will build a graph of all accessible memberships and find
 * distinct paths between targetRecord and contextRecord.
 * 1. [fetchRootMembership()] Load membership record for
 * (targetRecord,contextRecord) and call it a root (of the membership graph).
 * Also lets call array [root] a parentLevel.
 * 2. [findPaths()] Repeat until you have found needed number of paths or there is no
 * membership in parentLevel
 *   2.1 [fetchGraphLevel()] Load "next level" of memberships - load all membership
 *   records mentioned in intermediaries arrays in parentLevel memberships.
 *   2.2 [calculatePaths()] Try to find paths (by path we mean a connection
 *   between root and membership with directMemberhip==true).
 *   2.3 If number of paths is not satisfactory, then let
 *   parentLevel = all-memberships-loaded-in-this-iteration.
 * 
 * Because we search for paths level-by-level, then all found paths are the
 * shortest ones. It means, that the alogorithm is more BFS-like, than DFS-like.
 *
 * @module components/membership-visualiser
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get, getProperties, set } from '@ember/object';
import { sort } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import gri from 'onedata-gui-websocket-client/utils/gri';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { resolve, reject, Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import { getOwner } from '@ember/application';
import { groupedFlags as groupFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { groupedFlags as spaceFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { groupedFlags as harvesterFlags } from 'onedata-gui-websocket-client/utils/harvester-privileges-flags';
import { groupedFlags as clusterFlags } from 'onedata-gui-websocket-client/utils/cluster-privileges-flags';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import MembershipPath from 'onezone-gui/utils/membership-visualiser/membership-path';

export default Component.extend(I18n, {
  classNames: ['membership-visualiser'],
  classNameBindings: [
    'pathsLoadingProxy.isPending:loading',
    'isCondensed:condensed',
    'hasOnlyDirectPath:only-direct',
  ],

  store: service(),
  router: service(),
  guiUtils: service(),
  privilegeManager: service(),
  privilegeActions: service(),
  spaceActions: service(),
  groupActions: service(),
  harvesterActions: service(),
  clusterActions: service(),
  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser',

  /**
   * User or group
   * @type {User|Group}
   * @virtual
   */
  contextRecord: null,

  /**
   * Group, space, cluster or provider
   * @type {Group|Space|Cluster|Provider}
   * @virtual
   */
  targetRecord: null,

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
   * If true, paths will be rendered in more condensed and static way
   * (without actions).
   * @type {boolean}
   */
  isCondensed: false,

  /**
   * @type {number}
   */
  maxPathsNumber: 10,

  /**
   * If true, membership paths will have an additional text description.
   * @type {boolean}
   */
  showDescription: false,

  /**
   * Membership record for (targetRecord,contextRecord) pair
   * @type {Membership}
   */
  rootMembership: undefined,

  /**
   * Relation for privileges-editor-modal
   * @type {Utils/MembershipRelation|null}
   */
  relationPrivilegesToChange: null,

  /**
   * @type {Utils/MembershipRelation}
   */
  relationToRemove: null,

  /**
   * @type {boolean}
   */
  isRemovingRelation: false,

  /**
   * It is only used to control paths loading process. Its content is empty.
   * @type {PromiseObject}
   */
  pathsLoadingProxy: null,

  /**
   * Error that occurred while performing background (silent) reload.
   * @type {*}
   */
  silentReloadError: null,

  /**
   * All membership nodes used to build actual paths.
   * @type {Array<Membership>}
   */
  allNodes: null,

  /**
   * @type {boolean}
   */
  suppressNodesObserver: true,

  /**
   * @type {Array<string>}
   */
  sortedPathsOrder: Object.freeze([
    'isFilteredOut',
    'griPath.length',
    'concatenatedNames',
  ]),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils/MembershipVisualiser/MembershipPath>>}
   */
  paths: computed(function paths() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils/MembershipVisualiser/MembershipPath>>}
   */
  sortedPaths: sort('paths', 'sortedPathsOrder'),

  /**
   * If true then there is only one path, which represents a direct membership
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasOnlyDirectPath: computed('paths.[]', function hasOnlyDirectPath() {
    const paths = this.get('paths');
    return get(paths, 'length') === 1 && get(paths[0], 'griPath.length') === 1;
  }),

  /**
   * 1-level-nested tree with privileges. It should group privileges
   * into categories.
   * @type {Ember.ComputedProperty<Object>}
   */
  groupedPrivilegesFlags: computed(
    'relationPrivilegesToChange.parentType',
    function groupedPrivilegesFlags() {
      switch (this.get('relationPrivilegesToChange.parentType')) {
        case 'space':
          return spaceFlags;
        case 'group':
          return groupFlags;
        case 'harvester':
          return harvesterFlags;
        case 'cluster':
        default:
          return clusterFlags;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  privilegeGroupsTranslationsPath: computed(
    'relationPrivilegesToChange.parentType',
    function privilegeGroupsTranslationsPath() {
      const modelName =
        _.upperFirst(this.get('relationPrivilegesToChange.parentType'));
      return `components.content${modelName}sMembers.privilegeGroups`;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  privilegesTranslationsPath: computed(
    'relationPrivilegesToChange.parentType',
    function privilegesTranslationsPath() {
      const modelName =
        _.upperFirst(this.get('relationPrivilegesToChange.parentType'));
      return `components.content${modelName}sMembers.privileges`;
    }
  ),

  /**
   * Text for the header of the relation privileges tree
   * @type {Ember.ComputedProperty<string>}
   */
  privilegesTreeRootText: computed(
    'relationPrivilegesToChange',
    function privilegesTreeRootText() {
      const relation = this.get('relationPrivilegesToChange');
      if (relation) {
        return this.t('privilegesTreeRootText', {
          parentType: this.t(get(relation, 'parentType')),
          parentName: get(relation, 'parent.name'),
          upperChildType: _.upperFirst(this.t(get(relation, 'childType'))),
          childName: get(relation, 'child.name'),
        });
      } else {
        return '';
      }
    }
  ),

  /**
   * Privileges model for relation privileges editor
   * @type {Ember.ComputedProperty<PrivilegeModelProxy|null>}
   */
  privilegesEditorModel: computed(
    'groupedPrivilegesFlags',
    'relationPrivilegesToChange',
    function privilegesEditorModel() {
      const {
        relationPrivilegesToChange,
        privilegeManager,
        groupedPrivilegesFlags,
      } = this.getProperties(
        'relationPrivilegesToChange',
        'privilegeManager',
        'groupedPrivilegesFlags'
      );
      if (relationPrivilegesToChange) {
        const {
          parentType,
          childType,
        } = getProperties(relationPrivilegesToChange, 'parentType', 'childType');
        const gri = privilegeManager.generateGri(
          parentType,
          get(relationPrivilegesToChange, 'parent.entityId'),
          parentType === 'group' && childType === 'group' ? 'child' : childType,
          get(relationPrivilegesToChange, 'child.entityId'),
        );
        return PrivilegeRecordProxy.create(getOwner(this).ownerInjection(), {
          griArray: [gri],
          groupedPrivilegesFlags,
        });
      } else {
        return null;
      }
    }
  ),

  allNodesObserver: observer(
    'allNodes.@each.{intermediaries,directMembership,isForbidden,isDeleted}',
    function allNodesObserver() {
      if (!this.get('suppressNodesObserver')) {
        this.loadPaths(true);
      }
    }
  ),

  relationToRemoveObserver: observer(
    'relationToRemove.exists',
    function relationToRemoveObserver() {
      const {
        relationToRemove,
        isRemovingRelation,
      } = this.getProperties('relationToRemove', 'isRemovingRelation');
      // if relation disappeard without our action, close remove-relation modal
      if (
        relationToRemove &&
        !isRemovingRelation &&
        !get(relationToRemove, 'exists')
      ) {
        this.set('relationToRemove', null);
      }
    }
  ),

  relationPrivilegesToChangeObserver: observer(
    'relationPrivilegesToChange.canViewPrivileges',
    function relationPrivilegesToChangeObserver() {
      const {
        relationPrivilegesToChange,
        privilegesEditorModel,
      } = this.getProperties(
        'relationPrivilegesToChange',
        'privilegesEditorModel'
      );
      // if relation disappeard without action or user lost access to privileges
      // information, close privileges-editor modal
      if (
        relationPrivilegesToChange &&
        !get(privilegesEditorModel, 'isSaving') &&
        !get(relationPrivilegesToChange, 'canViewPrivileges')
      ) {
        this.set('relationPrivilegesToChange', null);
      }
    }
  ),

  recordObserver: observer(
    'targetRecord',
    'contextRecord',
    function recordObserver() {
      this.set('paths', []);
      this.loadPaths();
    }
  ),

  filterObserver: observer(
    'searchString',
    'contextRecord.name',
    'paths.@each.names',
    function filterObserver() {
      const {
        paths,
        searchString,
      } = this.getProperties('paths', 'searchString');
      if (get(searchString, 'length') === 0) {
        paths.forEach(path => set(path, 'isFilteredOut', false));
      } else {
        const contextName = this.get('contextRecord.name');
        const query = (searchString || '').toLowerCase();
        paths.forEach(path => {
          let isFilteredOut;
          if (get(path, 'model.isFulfilled')) {
            const names = [contextName].concat(get(path, 'names'));
            isFilteredOut =
              names.every(name => !name.toLowerCase().includes(query));
          } else {
            isFilteredOut = true;
          }
          set(path, 'isFilteredOut', isFilteredOut);
        });
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.recordObserver();
  },

  /**
   * Loads root node of all membership paths (membership model for targetRecord).
   * @returns {Promise}
   */
  fetchRootMembership() {
    const membershipGri = this.getMembershipGri(this.get('targetRecord.gri'));
    return this.fetchMembership(membershipGri, true)
      .then(rootMembership => safeExec(this, () => {
        this.set('rootMembership', rootMembership);
      }));
  },

  /**
   * Loads membership paths and creates MembershipPath models.
   * @param {boolean} silent if true, loading is done in background
   * (without reloading requests)
   * @returns {promise}
   */
  loadPaths(silent = false) {
    this.set('suppressNodesObserver', true);
    const promise = this.fetchRootMembership()
      .then(() => this.findPaths(silent))
      .then(({ allNodes, paths }) => safeExec(this, () => {
        const actualPaths = this.get('paths');
        paths = paths.map(pathDef => {
          const existingPath = actualPaths.findBy('id', get(pathDef, 'id'));
          if (existingPath) {
            return existingPath;
          } else {
            return MembershipPath.create(getOwner(this).ownerInjection(), {
              griPath: get(pathDef, 'griPath'),
            });
          }
        });
        this.setProperties({
          paths,
          allNodes,
          silentReloadError: null,
        });
      }))
      .catch(error => {
        safeExec(this, 'setProperties', {
          paths: [],
          allNodes: [],
        });
        if (silent) {
          safeExec(this, 'set', 'silentReloadError', error);
        }
        throw error;
      })
      .finally(() => safeExec(this, 'set', 'suppressNodesObserver', false));
    if (!silent) {
      // allows to render spinner
      this.set('pathsLoadingProxy', PromiseObject.create({
        promise,
      }));
    }
    return promise;
  },

  /**
   * Generates membership record gri related to given regular record gri.
   * @param {string} recordGri
   * @returns {string}
   */
  getMembershipGri(recordGri) {
    const {
      entityType,
      entityId,
    } = getProperties(this.get('contextRecord'), 'entityType', 'entityId');
    const parsedRecordGri = parseGri(recordGri);
    let aspectType = entityType;
    if (entityType === 'group' && get(parsedRecordGri, 'entityType') === 'group') {
      aspectType = 'child';
    }
    return gri(_.assign(parsedRecordGri, {
      aspect: `eff_${aspectType}_membership`,
      aspectId: entityId,
      scope: 'private',
    }));
  },

  /**
   * Loads membership record.
   * @param {string} membershipGri 
   * @param {boolean} forceReload 
   * @returns {Promise<Membership>}
   */
  fetchMembership(membershipGri, forceReload) {
    const store = this.get('store');
    const loadedRecord = store.peekRecord('membership', membershipGri);
    if (forceReload || !loadedRecord) {
      return store.findRecord('membership', membershipGri, { reload: true });
    } else {
      return resolve(loadedRecord);
    }
  },

  /**
   * Loads next level of membership graph. Iterates over parentLevel membership
   * and loads all (one level) nested memberships.
   * @param {Array<Membership>} parentLevel
   * @param {Map<string,Membership>} allNodesMap mapping recordGri -> membership
   *   related to the record
   * @param {boolean} silent if true, membership record instance from the
   *   store will be used if possible
   * @returns {promise<Array<Membership>>}
   */
  fetchGraphLevel(parentLevel, allNodesMap, silent) {
    const contextRecordEntityId = this.get('contextRecord.entityId');
    const newLevel = [];
    parentLevel.forEach(parentMembership => {
      if (!get(parentMembership, 'isForbidden') &&
        !get(parentMembership, 'isDeleted')) {
        get(parentMembership, 'intermediaries').forEach(intermediaryGri => {
          if (parseGri(intermediaryGri).entityId !== contextRecordEntityId) {
            const membershipGri = this.getMembershipGri(intermediaryGri);
            if (!allNodesMap.has(intermediaryGri)) {
              const fetchReload = !allNodesMap.has(intermediaryGri) || !silent;
              allNodesMap.set(intermediaryGri, null);
              const promise = this.fetchMembership(membershipGri, fetchReload)
                .catch(error => {
                  if (error && get(error, 'id') === 'forbidden') {
                    return null;
                  } else {
                    throw error;
                  }
                })
                .then(membership => {
                  allNodesMap.set(intermediaryGri, membership);
                  return membership;
                });
              newLevel.push(promise);
            }
          }
        });
      }
    });
    return Promise.all(newLevel).then(level => level.filter(x => x));
  },

  /**
   * Finds membership paths with optional membership fetch (if needed).
   * It is a start point for recursive method `findPathsForDeeperLevel`.
   * @param {boolean} silent 
   * @returns {promise<Object>} resolves to object in format:
   * ```
   * {
   *   allNodes: Array<Membership>
   *   paths: Array<{id: string, griPath: Array<string>}>
   * }
   * ```
   */
  findPaths(silent = false) {
    const allNodesMap = new Map();
    const rootNode = this.get('rootMembership');
    allNodesMap.set(this.get('targetRecord.gri'), rootNode);
    return this.findPathsForDeeperLevel(
      [rootNode],
      allNodesMap,
      silent
    ).then(paths => {
      const allNodesArray = A();
      allNodesMap.forEach(value => allNodesArray.pushObject(value));
      allNodesArray.pushObject(rootNode);
      return {
        allNodes: allNodesArray,
        paths: paths.map(path => ({
          id: path.join('|'),
          griPath: path,
        })),
      };
    });
  },

  /**
   * Loads deeper level of membership graph and then tries to find necessary
   * number of paths. If number of paths is smaller than specified target,
   * deeper level of the membership graph will be loaded (recursively).
   * @param {Array<Membership>} parentLevel
   * @param {Map<string,Membership>} allNodesMap
   * @param {boolean} silent
   * @returns {promise<Array<Array<string>>>} array of paths
   *   (each path is an array of gri)
   */
  findPathsForDeeperLevel(parentLevel, allNodesMap, silent) {
    const maxPathsNumber = this.get('maxPathsNumber');
    return this.fetchGraphLevel(parentLevel, allNodesMap, silent)
      .then(childLevel => {
        const paths = this.calculatePaths(allNodesMap, maxPathsNumber);
        if (paths.length >= maxPathsNumber || childLevel.length === 0) {
          return paths.slice(0, maxPathsNumber);
        } else {
          return this.findPathsForDeeperLevel(
            childLevel,
            allNodesMap,
            silent
          );
        }
      });
  },

  /**
   * Looks for all possible paths in the set of allNodesMap memberships.
   * @param {Map<string,Membership>} allNodesMap 
   * @param {number} limit limit of paths
   * @returns {Array<Array<string>>} 
   */
  calculatePaths(allNodesMap, limit) {
    const donePaths = [];
    let workingPaths = [
      [this.get('targetRecord.gri')],
    ];
    while (donePaths.length < limit && workingPaths.length > 0) {
      workingPaths = _.flatten(workingPaths.map(workingPath => {
        const lastNodeGri = workingPath[workingPath.length - 1];
        const lastNode = allNodesMap.get(lastNodeGri);
        if (lastNode && get(lastNode, 'isDeleted')) {
          return [];
        } else if (!lastNode || get(lastNode, 'isForbidden')) {
          donePaths.push(workingPath.concat([null]).reverse());
          return [];
        } else {
          if (get(lastNode, 'directMembership')) {
            donePaths.push(workingPath.slice(0).reverse());
          }
          return get(lastNode, 'intermediaries')
            .filter(intermediaryGri => !workingPath.includes(intermediaryGri))
            .map(intermediaryGri => workingPath.concat([intermediaryGri]));
        }
      }));
    }
    return donePaths;
  },

  actions: {
    view(record) {
      const {
        router,
        guiUtils,
      } = this.getProperties('router', 'guiUtils');
      const recordType = get(record, 'entityType');
      const sidebarType = recordType + 's';
      router.transitionTo(
        'onedata.sidebar.content.aspect',
        sidebarType,
        guiUtils.getRoutableIdFor(record),
        'index',
      );
    },
    savePrivileges() {
      const {
        privilegesEditorModel,
        privilegeActions,
        relationPrivilegesToChange,
      } = this.getProperties(
        'privilegesEditorModel',
        'privilegeActions',
        'relationPrivilegesToChange'
      );
      return privilegeActions.handleSave(privilegesEditorModel.save())
        .then(() => {
          get(relationPrivilegesToChange, 'parent').reload();
        })
        .finally(() => safeExec(this, 'set', 'relationPrivilegesToChange', null));
    },
    removeRelation() {
      const {
        relationToRemove,
        spaceActions,
        groupActions,
        harvesterActions,
        clusterActions,
      } = this.getProperties(
        'relationToRemove',
        'spaceActions',
        'groupActions',
        'harvesterActions',
        'clusterActions'
      );
      const {
        parentType,
        childType,
        parent,
        child,
      } = getProperties(
        relationToRemove,
        'parentType',
        'childType',
        'parent',
        'child'
      );
      let promise;
      switch (parentType) {
        case 'space':
          promise = childType === 'group' ?
            spaceActions.removeGroup(parent, child) :
            spaceActions.removeUser(parent, child);
          break;
        case 'group':
          promise = childType === 'group' ?
            groupActions.removeRelation(parent, child) :
            groupActions.removeUser(parent, child);
          break;
        case 'harvester':
          promise = childType === 'group' ?
            harvesterActions.removeGroupFromHarvester(parent, child) :
            harvesterActions.removeUserFromHarvester(parent, child);
          break;
        case 'cluster':
          promise = childType === 'group' ?
            clusterActions.removeMemberGroupFromCluster(parent, child) :
            clusterActions.removeMemberUserFromCluster(parent, child);
          break;
        default:
          promise = reject('membership-visualiser: cannot remove, unknown relation');
      }
      this.set('isRemovingRelation', true);
      return promise
        .finally(() =>
          safeExec(this, 'setProperties', {
            isRemovingRelation: false,
            relationToRemove: null,
          })
        )
        .then(() => safeExec(this, 'loadPaths'));
    },
  },
});
