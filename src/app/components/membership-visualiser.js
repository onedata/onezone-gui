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
import PrivilegeModelProxy from 'onezone-gui/utils/privilege-model-proxy';
import { getOwner } from '@ember/application';
import { groupedFlags as groupFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { groupedFlags as spaceFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';

/**
 * @typedef {Object} MembershipPath
 * @property {string} id
 * @property {Array<string>} griPath array of GRIs
 */

export default Component.extend(I18n, {
  classNames: ['membership-visualiser'],

  store: service(),
  privilegeManager: service(),
  privilegeActions: service(),

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
   * @type {number}
   */
  maxPathsNumber: 5,

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
   * @type {Ember.ComputedProperty<Ember.A>}
   */
  paths: computed(function paths() {
    return A();
  }),

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
        return PrivilegeModelProxy.create(getOwner(this).ownerInjection(), {
          griArray: [gri],
          groupedPrivilegesFlags,
        });
      } else {
        return null;
      }
    }
  ),

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

  actions: {
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
      } = this.getProperties('relationToRemove');
      this.set('isRemovingRelation', true);
      return Promise.resolve().then(() => 
        safeExec(this, 'setProperties', {
          isRemovingRelation: false,
          relationToRemove: null,
        })
      );
      // return groupActions.removeRelation(
      //     get(relationToRemove, 'parent'),
      //     get(relationToRemove, 'child')
      //   )
      //   .then(() => safeExec(this, 'reloadModel'))
      //   .finally(() =>
      //     safeExec(this, 'setProperties', {
      //       isRemovingRelation: false,
      //       relationToRemove: null,
      //     })
      //   );
    },
  },
});
