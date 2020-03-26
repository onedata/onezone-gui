/**
 * A component that shows groups hierarchy using tree like representation, where
 * each level of tree is represented as a column.
 * Graph is created using following elements:
 *  * Logic:
 *    - GroupsHierarchyVisualiser component - creates new columns, updates
 *      Workspace with new information on window resize.
 *    - Workspace - contains information about environment - width and height of
 *      available place, columns number and width, group box size etc.
 *      Is injected to all logic elements.
 *    - ColumnManager - manages columns. Allows adding and replacing columns
 *      with animation, automatically removes/adds columns to fulfill needed
 *      columns number.
 *    - Column - column representation. Handles column positioning and scrolling,
 *      creating group boxes according to given model. Automatically infers
 *      context using previous and next column and calculates position values,
 *      that are common for many elements inside column (to optimize calculations).
 *    - ColumnSeparator - calculates position of column separator elements.
 *    - GroupBox - calculates position for group box.
 *    - GroupBoxLine (including GroupBoxRightLine and GroupBoxLeftLine) - calculates
 *      position and hover state of lines related to specified group box.
 *    - Relation - simple class which represents a parent-child relation.
 * 
 *                   GroupsHierarchyVisualiser component
 *                                    |
 *                    +---------------+---------------+
 *                    |                               |
 *                    |1-1                            |1-1
 *                    |                               |
 *                Workspace                     ColumnManager
 *                                                    |
 *                                                    |1-n
 *                                                    |
 *                                                  Column
 *                                                    |
 *                                    +---------------+---------------+
 *                                    |                               |
 *                                    |1-m                            |1-1
 *                                    |                               |
 *                                 GroupBox                    ColumnSeparator
 *                                    |
 *                    +---------------+---------------+
 *                    |                               |
 *                    |1-1                            |1-1
 *                    |                               |
 *             GroupBoxLeftLine               GroupBoxRightLine
 *                    |                               |
 *                    |1-1                            |1-1
 *                    |                               |
 *            MembershipRelation              MembershipRelation
 * 
 *  * Components:
 *    - GroupsHierarchyVisualiser component - renders columns, related column
 *      separators and needed modals, handles group and relation actions.
 *    - GroupsHierarchyVisualiser/Column component - renders column header and
 *      group boxes in perfect scroll component. Also renders loading placeholder
 *      if necessary.
 *    - GroupsHierarchyVisualiser/ColumnSeparator component - renders vertical
 *      line between two columns. Also shows line that connects opposite group box
 *      lines to create a relation line.
 *    - GroupsHierarchyVisualiser/GroupBox component - renders group box: group
 *      box lines, name, name editor, group box relations and group actions.
 *    - GroupsHierarchyVisualiser/GroupBoxLeftLine and GroupBoxRightLine components
 *      - renders left/right line, that connects group box to the separator and
 *      optional relation actions.
 *    - GroupsHierarchyVisualiser/GroupBoxRelation component - renders child/parent
 *      relation indicator - number of groups in relation. It is a trigger to
 *      show/hide relation in previous/next column.
 *    - modals: GroupLeaveModal, GroupRemoveModal, GroupRemoveRelationModal,
 *      GroupCreateRelativeModal, GroupAddYourGroupModal, GroupJoinUsingTokenModal,
 *      PrivilegesEditorModal.
 * 
 *                        GroupsHierarchyVisualiser
 *                                    |
 *                    +---------------+---------------+
 *                    |                               |
 *                    |1-n                            |1-n
 *                    |                               |
 *             ColumnSeparator                      Column
 *                                                    |
 *                                                    |1-m
 *                                                    |
 *                                                 GroupBox
 *                                                    |
 *                                 +------------------+------------------+
 *                                 |                  |                  |
 *                                 |1-1               |1-1               |1-2
 *                                 |                  |                  |
 *                         GroupBoxLeftLine   GroupBoxRightLine  GroupBoxRelation
 * 
 * Column types:
 *   There are four types of columns:
 *     * empty - column used as a placeholder. It does not represent any
 *       relation/group.
 *     * startPoint - column used to initialize graph. It always contains only
 *       one group, which is the same as passed to GroupsHierarchyVisualiser
 *       component.
 *     * children - column with children of some group.
 *     * parents - column with parents of some group.
 *   To fully describe these types there are tree fields in Column class:
 *     * relationType - string name of the type: `empty`, `startPoint`,
 *       `children`, `parents`.
 *     * relatedGroup - group which is a context for relation. It must be not
 *       null for children and parents types, and null for empty and startPoint.
 *       For children it is a parent group for those children, for parents it
 *       is a children group of those parents.
 *     * model - ProxyObject with with group-list model. For empty type it should
 *       be a model with an empty array, for startPoint it must contain an array
 *       with exactly one group, for children/parents there are no requirements -
 *       can contain many groups, or be an empty array.
 * 
 * Flow:
 *   * GroupsHierarchyVisualiser component attaches its' own window resize
 *     handlers and setups Workspace and ColumnManager objects (Workspace is
 *     passed to ColumnManager).
 *   * Workspace calculates number of columns and column width according to
 *     detected component width. These informations are recalculated on each
 *     window resize.
 *   * ColumnManager observes Workspace.columnsNumber and adds empty/removes
 *     existing columns to satisfy columnsNumber requirement. When array of
 *     columns changes, ColumnManager updates prevColumn and nextColumn fields
 *     in columns, to allow them to recalculate tree context.
 *   * On init GroupsHierarchyVisualiser, depending on columnsNumber, tries to
 *     add startPoint column with main group and, if possible, children column
 *     for that group. Columns are created by GroupsHierarchyVisualiser methods
 *     and placed in tree using ColumnManager methods.
 *   * GroupsHierarchyVisualiser renders columns using
 *     GroupsHierarchyVisualiser/Column component.
 *   * Column observes model, and when there are new groups available, it creates
 *     new GroupBox objects.
 *   * According to searchString in Workspace and groupName in GroupBox Column
 *     sorts group boxes. Sorted array is then used to render group boxes using
 *     GroupsHierarchyVisualiser/GroupBox component.
 *   * Each GroupBox creates its' own GroupBoxLeftLine and GroupBoxRightLine
 *     instances.
 *   * GroupBox lines calculates theirs positions using values precalculated in
 *     Column (they are the same for all lines in the same column).
 *   * GroupBox position is calculated according to the index of group box in
 *     sorted group box array and the group box size values in Workspace.
 *   * Relation context - which group box has an expanded column and where to draw
 *     relation lines is calculated using data in Column.prevColumn and
 *     Column.nextColumn and is available through fields:
 *     Column.parentsRelationGroupBox, Column.childrenRelationGroupBox,
 *     Column.hasParentsLines, Column.hasChildrenLines.
 *   * Using column relation context proper GroupBox is marked as active and
 *     some lines changes thier visibility status and actions availability
 *     (relation actions, which are placed on lines are available only on "n"
 *     part of 1-n relation line. In code it means, that only left or right group
 *     box line or none of them can have available actions, not both).
 *   * Having information about group box lines placement, ColumnSeparator can
 *     calculate positions of separator lines. Separator draws lines between
 *     column, where it is placed and the nextColumn so it does not depend on
 *     prevColumn.
 *   * GroupsHierarchyVisualiser/ColumnSeparator component renders separator,
 *     GroupsHierarchyVisualiser/GroupBox component renders group box,
 *     GroupsHierarchyVisualiser/GroupBoxLine component renders right and left 
 *     group box line and GroupsHierarchyVisualiser/GroupBoxRelation renders
 *     relation indicator. There are no calculations, that depend on already
 *     rendered components (e.g. real height of rendered group box) - all values
 *     are fixed in Workspace and properties computed in utils.
 *
 * @module components/groups-hierarchy-visualiser
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, {
  computed,
  get,
  getProperties,
  set,
  setProperties,
  observer,
} from '@ember/object';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise, resolve, reject } from 'rsvp';
import ColumnManager from 'onezone-gui/utils/groups-hierarchy-visualiser/column-manager';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';
import {
  createEmptyColumnModel,
  default as Column,
} from 'onezone-gui/utils/groups-hierarchy-visualiser/column';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import { getOwner } from '@ember/application';

export default Component.extend(I18n, {
  classNames: ['groups-hierarchy-visualiser'],

  i18n: service(),
  groupManager: service(),
  groupActions: service(),
  tokenActions: service(),
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
   * Group for join-as-user-modal
   * @type {Group|null}
   */
  groupToJoin: null,

  /**
   * If true, user is joining `groupToJoin`
   * @type {boolean}
   */
  isJoiningGroup: false,

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
   * @type {Utils/MembershipRelation|null}
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
   * Relation for privileges-editor-modal
   * @type {Utils/MembershipRelation|null}
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
          parentName: get(relation, 'parent.name'),
          childName: get(relation, 'child.name'),
        });
      } else {
        return '';
      }
    }
  ),

  /**
   * Privileges model for relation privileges editor
   * @type {Ember.ComputedProperty<PrivilegeRecordProxy|null>}
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
        const gri = privilegeManager.generateGri(
          'group',
          get(relationPrivilegesToChange, 'parent.entityId'),
          'child',
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

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @returns {undefined}
   */
  windowResizeHandler: computed(function windowResizeHandler() {
    return () => this.recalculateAvailableArea();
  }),

  groupToLeaveObserver: observer(
    'groupToLeave.directMembership',
    function groupToLeaveObserver() {
      const {
        groupToLeave,
        isLeavingGroup,
      } = this.getProperties('groupToLeave', 'isLeavingGroup');
      // if user left group without our action, close leave-group modal
      if (
        groupToLeave &&
        !isLeavingGroup &&
        !get(groupToLeave, 'directMembership')
      ) {
        this.set('groupToLeave', null);
      }
    }
  ),

  groupToJoinObserver: observer(
    'groupToJoin.directMembership',
    function groupToJoinObserver() {
      const {
        groupToJoin,
        isJoiningGroup,
      } = this.getProperties('groupToJoin', 'isJoiningGroup');
      // if user joined group without our action, close join-as-user modal
      if (
        groupToJoin &&
        !isJoiningGroup &&
        get(groupToJoin, 'directMembership')
      ) {
        this.set('groupToJoin', null);
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
      // Actual first column, which is empty
      const actualFirstColumn = columns.objectAt(0);
      // Load start-point column (with one group from `group` field)
      const startPointColumn = this.createColumn('startPoint');

      if (columnsNumber >= 3) {
        const parentsColumn = this.createColumn('parents', group);
        columnManager.replaceColumn(actualFirstColumn, parentsColumn);
        columnManager.insertColumnAfter(startPointColumn, parentsColumn);
      } else {
        columnManager.replaceColumn(actualFirstColumn, startPointColumn);
      }
      if (columnsNumber >= 2) {
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
      promise = parentGroup.belongsTo('childList').reload()
        .then(childList => {
          return childList.hasMany('list').reload()
            .then(groupsList => Promise.all(
              groupsList.map(g => g.reload())
            ))
            .then(() => childList);
        });
    } else {
      promise = reject({ id: 'forbidden' });
    }
    return PromiseObject.create({ promise });
  },

  /**
   * Returns model for parents column for specified group
   * @param {Group} childGroup
   * @returns {PromiseArray<ManyArray<Group>>}
   */
  loadGroupParents(childGroup) {
    let promise;
    if (get(childGroup, 'hasViewPrivilege')) {
      promise = childGroup.belongsTo('parentList').reload()
        .then(parentList => {
          return parentList.hasMany('list').reload()
            .then(list => Promise.all(
              list.map(g => g.reload())
            ))
            .then(() => parentList);
        });
    } else {
      promise = reject({ id: 'forbidden' });
    }
    return PromiseObject.create({ promise });
  },

  /**
   * Returns model for start-point column
   * @returns {PromiseArray<Ember.A<Group>>}
   */
  loadThisGroupAsArray() {
    return PromiseObject.create({
      promise: this.get('group').reload()
        .then(groupProxy => EmberObject.create({
          list: PromiseArray.create({ promise: resolve(A([groupProxy])) }),
        })),
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
        return createEmptyColumnModel();
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
    const groupId = get(group, 'id');
    return navigationState
      .resourceCollectionContainsId(groupId)
      .then(contains => {
        if (!contains) {
          next(() => router.transitionTo('onedata.sidebar', 'groups'));
        }
        return !contains;
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
        set(column, 'model', PromiseObject.create({ promise: modelPromise }));
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
        tokenActions,
      } = this.getProperties(
        'groupConsumingToken',
        'tokenActions'
      );
      this.set('isGroupConsumingToken', true);
      return tokenActions.createConsumeInviteTokenAction({
          joiningRecord: groupConsumingToken,
          targetModelName: 'group',
          token,
          dontRedirect: true,
        }).execute()
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
    joinGroup() {
      const {
        groupToJoin,
        groupActions,
      } = this.getProperties('groupToJoin', 'groupActions');
      this.set('isJoiningGroup', true);
      return groupActions.joinGroupAsUser(groupToJoin)
        .finally(() =>
          safeExec(this, 'setProperties', {
            isJoiningGroup: false,
            groupToJoin: null,
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
              safeExec(this, 'reloadModel');
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
        .finally(() =>
          safeExec(this, 'setProperties', {
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
          get(relationToRemove, 'parent'),
          get(relationToRemove, 'child')
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
