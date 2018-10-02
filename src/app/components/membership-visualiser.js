import Component from '@ember/component';
import EmberObject, { computed, observer, get, getProperties, set } from '@ember/object';
import { sort } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import gri from 'onedata-gui-websocket-client/utils/gri';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { resolve, Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import { getOwner } from '@ember/application';
import { groupedFlags as groupFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { groupedFlags as spaceFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

const MembershipPath = EmberObject.extend({
  store: service(),

  griPath: Object.freeze([]),

  isFilteredOut: false,

  /**
   * @type {string}
   */
  id: computed('griPath', function id() {
    return this.get('griPath').join('|');
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<GraphSingleModel>>}
   */
  model: computed('griPath', function model() {
    return PromiseArray.create({
      promise: Promise.all(
        this.get('griPath').map(recordGri => this.fetchRecordByGri(recordGri)),
      ),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  names: computed('model.content.@each.name', function names() {
    return (this.get('model.content') || A()).mapBy('name');
  }),

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
});

export default Component.extend(I18n, {
  classNames: ['membership-visualiser'],
  classNameBindings: ['pathsLoadingProxy.isPending:loading', 'isCondensed:condensed'],

  store: service(),
  router: service(),
  guiUtils: service(),
  privilegeManager: service(),
  privilegeActions: service(),
  spaceActions: service(),
  groupActions: service(),
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
   * Group, space or privider
   * @type {Group|Space|Provider}
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
  maxPathsNumber: 20,

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
   * @type {PromiseObject}
   */
  pathsLoadingProxy: null,

  /**
   * @type {*}
   */
  silentReloadError: null,

  /**
   * @type {Array<Membership>}
   */
  allNodes: null,

  /**
   * @type {boolean}
   */
  suppressNodesObserver: true,

  /**
   * @type {Ember.ComputedProperty<Ember.A<MembershipPath>>}
   */
  paths: computed(function paths() {
    return A();
  }),

  /**
   * @type {Array<string>}
   */
  sortedPathsOrder: Object.freeze(['isFilteredOut']),

  /**
   * @type {Ember.ComputedProperty<Ember.A<MembershipPath>>}
   */
  sortedPaths: sort('paths', 'sortedPathsOrder'),

  /**
   * 1-level-nested tree with privileges. It should group privileges
   * into categories.
   * @type {Ember.ComputedProperty<Object>}
   */
  groupedPrivilegesFlags: computed(
    'relationPrivilegesToChange.parentType',
    function groupedPrivilegesFlags() {
      return this.get('relationPrivilegesToChange.parentType') === 'space' ?
        spaceFlags : groupFlags;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  privilegeGroupsTranslationsPath: computed(
    'relationPrivilegesToChange.parentType',
    function privilegeGroupsTranslationsPath() {
      const modelName = 
        this.get('relationPrivilegesToChange.parentType') === 'space' ?
        'Space' : 'Group';
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
        this.get('relationPrivilegesToChange.parentType') === 'space' ?
        'Space' : 'Group';
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
        isSavingRelationPrivileges,
      } = this.getProperties(
        'relationPrivilegesToChange',
        'isSavingRelationPrivileges'
      );
      // if relation disappeard without action or user lost access to privileges
      // information, close privileges-editor modal
      if (
        relationPrivilegesToChange &&
        !isSavingRelationPrivileges &&
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

  filterObserver: observer('searchString', 'paths.@each.names', function filterObserver() {
    const {
      paths,
      searchString,
    } = this.getProperties('paths', 'searchString');
    if (get(searchString, 'length') === 0) {
      paths.forEach(path => set(path, 'isFilteredOut', false));
    } else {
      paths.forEach(path => {
        let isFilteredOut;
        if (get(path, 'model.isFulfilled')) {
          const names = get(path, 'names');
          const query = (searchString || '').toLowerCase();
          isFilteredOut = names.every(name => !name.toLowerCase().includes(query));
        } else {
          isFilteredOut = true;
        }
        set(path, 'isFilteredOut', isFilteredOut);
      });
    }
  }),

  init() {
    this._super(...arguments);
    this.recordObserver();
  },

  fetchRootMembership() {
    return this.fetchMembership(this.getMembershipGri(this.get('targetRecord.gri')), true)
      .then(rootMembership => safeExec(this, () => {
        this.set('rootMembership', rootMembership);
      }));
  },

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
      this.set('pathsLoadingProxy', PromiseObject.create({
        promise,
      }));
    }
    return promise;
  },

  getMembershipGri(recordGri) {
    const {
      entityType,
      entityId,
    } = getProperties(this.get('contextRecord'), 'entityType', 'entityId');
    return gri(_.assign(parseGri(recordGri), {
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

  fetchGraphLevel(parentLevel, nodeParents, allNodes, silent) {
    const newLevel = [];
    parentLevel.forEach(parentMembership => {
      if (
        !get(parentMembership, 'isForbidden') &&
        !get(parentMembership, 'isDeleted')
      ) {
        get(parentMembership, 'intermediaries').forEach(itermediaryGri => {
          const intermediaryParents = nodeParents.get(itermediaryGri) || [];
          if (!intermediaryParents.includes(parentMembership)) {
            intermediaryParents.push(parentMembership);
            nodeParents.set(itermediaryGri, intermediaryParents);
            const membershipGri = this.getMembershipGri(itermediaryGri);
            const promise = this.fetchMembership(membershipGri, !allNodes.has(itermediaryGri) || !silent)
              .then(membership => {
                allNodes.set(itermediaryGri, membership);
                return membership;
              });
            newLevel.push(promise);
          }
        });
      }
    });
    return Promise.all(newLevel);
  },

  findPaths(silent = false) {
    const allNodes = new Map();
    const rootNode = this.get('rootMembership');
    allNodes.set(this.get('targetRecord.gri'), rootNode);
    return this.findPathsForDeeperLevel(
      [rootNode],
      allNodes,
      new Map(),
      silent
    ).then(paths => {
      const allNodesArray = A();
      allNodes.forEach(value => allNodesArray.pushObject(value));
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

  findPathsForDeeperLevel(parentLevel, allNodes, nodeParents, silent) {
    const maxPathsNumber = this.get('maxPathsNumber');
    return this.fetchGraphLevel(parentLevel, nodeParents, allNodes, silent)
      .then(childLevel => {
        const paths = this.calculatePaths(allNodes, maxPathsNumber);
        if (paths.length >= maxPathsNumber || childLevel.length === 0) {
          return paths.slice(0, maxPathsNumber);
        }
        else {
          return this.findPathsForDeeperLevel(
            childLevel,
            allNodes,
            nodeParents,
            silent
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
        if (
          !lastNode || get(lastNode, 'isForbidden') || get(lastNode, 'isDeleted')
        ) {
          // node has not been fetched yet or is not available
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
      } = this.getProperties(
        'privilegesEditorModel',
        'privilegeActions'
      );
      return privilegeActions.handleSave(privilegesEditorModel.save())
        .finally(() =>
          safeExec(this, 'setProperties', {
            relationPrivilegesToChange: null,
          })
        );
    },
    removeRelation() {
      const {
        relationToRemove,
        spaceActions,
        groupActions,
      } = this.getProperties(
        'relationToRemove',
        'spaceActions',
        'groupActions'
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
      if (parentType === 'space') {
        promise = childType === 'group' ?
          spaceActions.removeGroup(parent, child) :
          spaceActions.removeUser(parent, child);
      } else {
        promise = childType === 'group' ?
          groupActions.removeRelation(parent, child) :
          groupActions.removeUser(parent, child);
      }
      this.set('isRemovingRelation', true);
      return promise.then(() => 
        safeExec(this, () => {
          this.setProperties({
            isRemovingRelation: false,
            relationToRemove: null,
          });
          this.loadPaths();
        })
      );
    },
  },
});
