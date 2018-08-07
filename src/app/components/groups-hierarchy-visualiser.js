/**
 * A component that shows groups hierarchy using graph like representation.
 *
 * @module components/groups-hierarchy-visualiser
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { computed, get, getProperties, set, setProperties, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { Promise, resolve, reject } from 'rsvp';
import ColumnManager from 'onezone-gui/utils/groups-hierarchy-visualiser/column-manager';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';
import Column from 'onezone-gui/utils/groups-hierarchy-visualiser/column';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';

export default Component.extend(I18n, {
  classNames: ['groups-hierarchy-visualiser'],

  i18n: service(),
  groupManager: service(),
  groupActions: service(),
  privilegeManager: service(),
  privilegeActions: service(),
  globalNotify: service(),
  navigationState: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.groupsHierarchyVisualiser',

  /**
   * Group that will be a start point for graph.
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * Privileges definition for groups
   * @type {Object}
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * Group for group-leave-modal
   * @type {Group|null}
   */
  groupToLeave: null,

  /**
   * If true, user is leaving `groupToLeave`
   * @type {boolean}
   */
  isLeavingGroup: false,

  /**
   * Group for group-remove-modal
   * @type {Group|null}
   */
  groupToRemove: null,

  /**
   * If true, system is removing `groupToRemove`
   * @type {boolean}
   */
  isRemovingGroup: false,

  /**
   * Relation for group-remove-relation-modal
   * @type {Utils/GroupHierarchyVisualiser/Relation|null}
   */
  relationToRemove: null,

  /**
   * If true, system is removing `relationToRemove`
   * @type {boolean}
   */
  isRemovingRelation: false,

  /**
   * Group for group-create-relative-modal
   * @type {Group|null}
   */
  groupToCreateRelative: null,

  /**
   * New relative group type for group-create-relative-modal.
   * One of `parent`, `child`
   * @type {string}
   */
  newRelativeGroupType: 'child',

  /**
   * If true, system is creating new child|parent group for `groupToCreateRelative`
   * @type {boolean}
   */
  isCreatingRelativeGroup: false,

  /**
   * Group for group-add-your-group-modal
   * @type {Group|null}
   */
  groupToAddYourGroup: null,

  /**
   * Relative group type for group-add-your-group-modal. One of `parent`, `child`
   * @type {string}
   */
  addYourGroupType: 'child',

  /**
   * If true, system is adding child|parent group to `groupToAddYourGroup`
   * @type {boolean}
   */
  isAddingYourGroup: false,

  /**
   * Group for group-join-using-token-modal
   * @type {Group|null}
   */
  groupConsumingToken: null,

  /**
   * If true, system is joining `groupConsumingToken` to some group using token
   * @type {boolean}
   */
  isGroupConsumingToken: false,

  /**
   * Group for group-invite-using-token-modal
   * @type {Group|null}
   */
  invitingGroupUsingToken: null,

  /**
   * Relation for privileges-editor-modal
   * @type {Utils/GroupHierarchyVisualiser/Relation|null}
   */
  relationPrivilegesToChange: null,

  /**
   * If true, system is changing privileges for `relationPrivilegesToChange`
   * @type {boolean}
   */
  isSavingRelationPrivileges: false,

  /**
   * Window object (for testing purposes).
   * @type {Window}
   */
  _window: window,

  /**
   * Workspace definition
   * @type {Ember.ComputedProperty<Utils/GroupsHierarchyVisualiser/Workspace>}
   */
  workspace: computed(function workspace() {
    return Workspace.create();
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  searchString: alias('workspace.searchString'),

  /**
   * Column manager instance
   * @type {Ember.ComputedProperty<Utils/GroupsHierarchyVisualiser/ColumnManager>}
   */
  columnManager: computed('workspace', function columnManager() {
    return ColumnManager.create({
      workspace: this.get('workspace'),
    });
  }),

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
          parentName: get(relation, 'parentGroup.name'),
          childName: get(relation, 'childGroup.name'),
        });
      } else {
        return '';
      }
    }
  ),

  /**
   * Privileges model for relation privileges editor
   * @type {Ember.ComputedProperty<PrivilegesModelProxy|null>}
   */
  privilegesEditorModel: computed(
    'relationPrivilegesToChange',
    function privilegesEditorModel() {
      const {
        relationPrivilegesToChange,
        privilegeManager,
      } = this.getProperties('relationPrivilegesToChange', 'privilegeManager');
      if (relationPrivilegesToChange) {
        return EmberObject.create({
          modelGri: privilegeManager.generateGri(
            'group',
            get(relationPrivilegesToChange, 'parentGroup.entityId'),
            'child',
            get(relationPrivilegesToChange, 'childGroup.entityId'),
          ),
        });
      } else {
        return null;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @returns {undefined}
   */
  windowResizeHandler: computed(function windowResizeHandler() {
    return () => this.recalculateAvailableArea();
  }),

  /**
   * Observes resetTrigger changes. Exact value of the resetTrigger
   * is not important.
   */
  resetObserver: observer('resetTrigger', function resetObserver() {
    const {
      workspace,
      columnManager,
      group,
    } = this.getProperties('workspace', 'columnManager', 'group');
    const columnsNumber = get(workspace, 'columnsNumber');
    const columns = get(columnManager, 'columns');

    if (columnsNumber > 0) {
      // Load start-point column (with one group from `group` field)
      const startPointColumn = this.createColumn('startPoint');
      columnManager.replaceColumn(columns.objectAt(0), startPointColumn);

      // If there is enough space, load also children of that group
      if (columnsNumber > 1) {
        columnManager.insertColumnAfter(
          this.createColumn('children', group),
          startPointColumn
        );
      }
    }
  }),

  /**
   * Checks if some of the columns is related to deleted group. In that case
   * such column needs to be changed to empty.
   */
  removedRelatedGroupObserver: observer(
    'columnManager.columns.@each.isRelatedGroupDeleted',
    function removedRelatedGroupObserver() {
      this.get('columnManager.columns').forEach(column => {
        if (get(column, 'isRelatedGroupDeleted')) {
          setProperties(column, {
            relatedGroup: null,
            relationType: 'empty',
          });
          // recalculate model according to above new specification
          set(column, 'model', this.createColumnModel(column));
        }
      });
    }
  ),

  didInsertElement() {
    this._super(...arguments);

    const {
      windowResizeHandler,
      _window,
    } = this.getProperties(
      'windowResizeHandler',
      '_window'
    );

    _window.addEventListener('resize', windowResizeHandler);

    // Detect initial size of the component
    windowResizeHandler();

    // Initialize graph
    this.resetObserver();
  },

  willDestroyElement() {
    try {
      const {
        windowResizeHandler,
        _window,
      } = this.getProperties(
        'windowResizeHandler',
        '_window'
      );

      _window.removeEventListener('resize', windowResizeHandler);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Updates component width and height in workspace
   * @returns {undefined}
   */
  recalculateAvailableArea() {
    this.get('workspace').setProperties({
      width: this.$().width(),
      height: this.$().height(),
    });
  },

  /**
   * Returns model for children column for specified group
   * @param {Group} parentGroup
   * @returns {PromiseArray<ManyArray<Group>>}
   */
  loadGroupChildren(parentGroup) {
    let promise;
    if (get(parentGroup, 'hasViewPrivilege')) {
      promise = get(parentGroup, 'childList')
        .then(childList => get(childList, 'list'))
        .then(groupsList => Promise.all(
          groupsList.map(g => g.reload())
        ).then(() => groupsList));
    } else {
      promise = reject({ id: 'forbidden' });
    }
    return PromiseArray.create({ promise });
  },

  /**
   * Returns model for parents column for specified group
   * @param {Group} childGroup
   * @returns {PromiseArray<ManyArray<Group>>}
   */
  loadGroupParents(childGroup) {
    let promise;
    if (get(childGroup, 'hasViewPrivilege')) {
      promise = get(childGroup, 'parentList')
        .then(parentList => get(parentList, 'list'))
        .then(list => Promise.all(
          list.map(g => g.reload())).then(() => list));
    } else {
      promise = reject({ id: 'forbidden' });
    }
    return PromiseArray.create({ promise });
  },

  /**
   * Returns model for start-point column
   * @returns {PromiseArray<Ember.A<Group>>}
   */
  loadThisGroupAsArray() {
    return PromiseArray.create({
      promise: this.get('group').reload()
        .then(groupProxy => A([groupProxy])),
    });
  },

  /**
   * Creates new column
   * @param {string} relationType One of `empty`, `startPoint`, `children`,
   *   `parents`
   * @param {Group|null} relatedGroup Related group according to type of
   *   relation. It is a parent group for `children` relation and child
   *   group for `parents` relation.
   * @returns {Utils/GroupsHierarchyVisualiser/Column}
   */
  createColumn(relationType = 'empty', relatedGroup = null) {
    const column = Column.create({
      relationType: relationType,
      relatedGroup,
    });
    column.set('model', this.createColumnModel(column));
    return column;
  },

  /**
   * Creates column model using column relation specification
   * @param {Utils/GroupsHierarchyVisualiser/Column} column 
   * @returns {PromiseArray<Array<Group>>}
   */
  createColumnModel(column) {
    const {
      relatedGroup,
      relationType,
    } = getProperties(column, 'relatedGroup', 'relationType');
    switch (relationType) {
      case 'startPoint':
        return this.loadThisGroupAsArray();
      case 'parents':
        return this.loadGroupParents(relatedGroup);
      case 'children':
        return this.loadGroupChildren(relatedGroup);
      case 'empty':
        return PromiseArray.create({ promise: resolve(A()) });
    }
  },

  /**
   * If actual group disappeared from the sidebar, redirects to groups main page
   * @returns {Promise<boolean>} resolves to true if redirect is needed
   */
  redirectOnGroupDeletion() {
    const {
      navigationState,
      group,
      router,
    } = this.getProperties('navigationState', 'group', 'router');
    const groupEntityId = get(group, 'entityId');
    return navigationState.resourceCollectionContainsEntityId(groupEntityId)
      .then(contains => {
        if (contains) {
          next(() => router.transitionTo('onedata.sidebar', 'groups'));
        }
        return contains;
      });
  },

  /**
   * Reloads model of all columns
   * @returns {undefined}
   */
  reloadModel() {
    const columns = this.get('columnManager.columns');
    // There may be many columns with the same relatedGroup.
    // Using map instead of array to minimize the number of requests.
    const relatedGroupsReloadPromises = new Map();
    columns
      .forEach(column => {
        const relatedGroup = get(column, 'relatedGroup');
        let relatedGroupReloadPromise;
        if (!relatedGroup) {
          relatedGroupReloadPromise = resolve();
        } else if (relatedGroupsReloadPromises.has(relatedGroup)) {
          relatedGroupReloadPromise = relatedGroupsReloadPromises.get(relatedGroup);
        } else {
          relatedGroupReloadPromise = relatedGroup.reload();
          relatedGroupsReloadPromises.set(relatedGroup, relatedGroupReloadPromise);
        }
        const modelPromise = relatedGroupReloadPromise
          .then(() => this.createColumnModel(column));
        set(column, 'model', PromiseArray.create({ promise: modelPromise }));
      });
  },

  actions: {
    showChildren(column, group) {
      let newColumn;
      if (get(column, 'childrenRelationGroupBox.group') === group) {
        // Children are visible. Replace children column with empty
        newColumn = this.createColumn();
      } else if (get(group, 'hasViewPrivilege')) {
        newColumn = this.createColumn('children', group);
      }
      this.get('columnManager').insertColumnAfter(newColumn, column);
    },
    showParents(column, group) {
      let newColumn;
      if (get(column, 'parentsRelationGroupBox.group') === group) {
        // Parents are visible. Replace parents column with empty
        newColumn = this.createColumn();
      } else if (get(group, 'hasViewPrivilege')) {
        newColumn = this.createColumn('parents', group);
      }
      this.get('columnManager').insertColumnBefore(newColumn, column);
    },
    viewGroup(group) {
      this.get('groupActions').redirectToGroup(group);
    },
    renameGroup(group, name) {
      if (!name || !name.length) {
        return reject();
      }

      const globalNotify = this.get('globalNotify');
      const oldName = get(group, 'name');
      set(group, 'name', name);
      return group.save()
        .catch((error) => {
          globalNotify.backendError(this.t('groupPersistence'), error);
          // Restore old group name
          set(group, 'name', oldName);
          throw error;
        });
    },
    showCreateRelativeModal(group, relation) {
      this.setProperties({
        groupToCreateRelative: group,
        newRelativeGroupType: relation,
      });
    },
    createRelative(newGroupName) {
      const {
        groupToCreateRelative,
        newRelativeGroupType,
        groupActions,
      } = this.getProperties(
        'groupToCreateRelative',
        'newRelativeGroupType',
        'groupActions'
      );
      let createFunction = newRelativeGroupType === 'parent' ?
        groupActions.createParent : groupActions.createChild;
      createFunction = createFunction.bind(groupActions);

      this.set('isCreatingRelativeGroup', true);
      return createFunction(groupToCreateRelative, { name: newGroupName })
        .finally(() =>
          safeExec(this, 'setProperties', {
            isCreatingRelativeGroup: false,
            groupToCreateRelative: null,
          })
        );
    },
    showAddYourGroupModal(group, relation) {
      this.setProperties({
        groupToAddYourGroup: group,
        addYourGroupType: relation,
      });
    },
    addYourGroup(group) {
      const {
        groupToAddYourGroup,
        addYourGroupType,
        groupActions,
      } = this.getProperties(
        'groupToAddYourGroup',
        'addYourGroupType',
        'groupActions'
      );
      let createFunction = addYourGroupType === 'parent' ?
        groupActions.addParent : groupActions.addChild;
      createFunction = createFunction.bind(groupActions);

      this.set('isAddingYourGroup', true);
      return createFunction(groupToAddYourGroup, group)
        .finally(() =>
          safeExec(this, 'setProperties', {
            isAddingYourGroup: false,
            groupToAddYourGroup: null,
          })
        );
    },
    joinUsingToken(token) {
      const {
        groupConsumingToken,
        groupActions,
      } = this.getProperties(
        'groupConsumingToken',
        'groupActions'
      );
      this.set('isGroupConsumingToken', true);
      return groupActions.joinGroupAsSubgroup(groupConsumingToken, token, false)
        .then(() => safeExec(this, 'reloadModel'))
        .finally(() =>
          safeExec(this, 'setProperties', {
            isGroupConsumingToken: false,
            groupConsumingToken: null,
          })
        );
    },
    leaveGroup() {
      const {
        groupToLeave,
        groupActions,
      } = this.getProperties('groupToLeave', 'groupActions');
      this.set('isLeavingGroup', true);
      return groupActions.leaveGroup(groupToLeave)
        .then(() =>
          this.redirectOnGroupDeletion().then(willRedirect => {
            if (!willRedirect) {
              safeExec(this, 'reloadModel');
            }
          })
        )
        .finally(() =>
          safeExec(this, 'setProperties', {
            isLeavingGroup: false,
            groupToLeave: null,
          })
        );
    },
    removeGroup() {
      const {
        groupToRemove,
        groupActions,
      } = this.getProperties('groupToRemove', 'groupActions');
      this.set('isRemovingGroup', true);
      return groupActions.deleteGroup(groupToRemove)
        .then(() =>
          this.redirectOnGroupDeletion().then(willRedirect => {
            if (!willRedirect) {
              safeExec(this, 'reloadModel', groupToRemove);
            }
          })
        )
        .finally(() =>
          safeExec(this, 'setProperties', {
            isRemovingGroup: false,
            groupToRemove: null,
          })
        );
    },
    savePrivileges() {
      const {
        privilegesEditorModel,
        privilegeManager,
        privilegeActions,
      } = this.getProperties(
        'privilegesEditorModel',
        'privilegeManager',
        'privilegeActions'
      );
      const {
        modifiedPrivileges,
        model,
      } = getProperties(privilegesEditorModel, 'modifiedPrivileges', 'model');
      set(model, 'privileges', privilegeManager.treeToArray(modifiedPrivileges));

      this.set('isSavingRelationPrivileges', true);
      const promise = get(model, 'content').save()
        .catch(error => {
          get(model, 'content').rollbackAttributes();
          throw error;
        });
      return privilegeActions.handleSave(promise)
        .finally(() =>
          safeExec(this, 'setProperties', {
            isSavingRelationPrivileges: false,
            relationPrivilegesToChange: null,
          })
        );
    },
    removeRelation() {
      const {
        relationToRemove,
        groupActions,
      } = this.getProperties('relationToRemove', 'groupActions');
      this.set('isRemovingRelation', true);
      return groupActions.removeRelation(
          get(relationToRemove, 'parentGroup'),
          get(relationToRemove, 'childGroup')
        )
        .then(() => safeExec(this, 'reloadModel'))
        .finally(() =>
          safeExec(this, 'setProperties', {
            isRemovingRelation: false,
            relationToRemove: null,
          })
        );
    },
  },
});
