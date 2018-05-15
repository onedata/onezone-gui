import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';

export default Component.extend({
  classNames: ['permissions-tree-editor'],

  i18n: inject(),
  store: inject(),

  /**
   * @type {array<object>}
   */
  permissionsGroups: Object.freeze([]),

  /**
   * Path to the translations of permission groups names
   * @type {string}
   */
  permissionGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of permissions names
   * @type {string}
   */
  permissionsTranslationsPath: undefined,

  /**
   * Model with permissions.
   */
  modelProxy: Object.freeze({}),

  /**
   * Initial state of the permissions.
   * @type {Object}
   */
  overridePermissions: reads('modelProxy.overridePermissions'),

  /**
   * Actually saved permissions (used to show diff).
   * @type {Object}
   */
  persistedPermissions: reads('modelProxy.persistedPermissions'),

  /**
   * @type {Ember.ComputedProperty<array<object>}
   */
  initialTreeState: computed(
    'permissionsGroups',
    'permissionGroupsTranslationsPath',
    'permissionsTranslationsPath',
    function () {
      const {
        permissionsGroups,
        permissionGroupsTranslationsPath,
        permissionsTranslationsPath,
        i18n,
      } = this.getProperties(
        'permissionsGroups',
        'permissionGroupsTranslationsPath',
        'permissionsTranslationsPath',
        'i18n'
      );
      return permissionsGroups.map(permissionsGroup => {
        const groupName = permissionsGroup.groupName;
        const permissionsNodes = permissionsGroup.permissions.map(permission => ({
          name: permission,
          text: i18n.t(permissionsTranslationsPath + '.' + permission),
          field: {
            type: 'checkbox',
          },
        }));
        return {
          name: groupName,
          text: i18n.t(permissionGroupsTranslationsPath + '.' + groupName),
          allowSubtreeCheckboxSelect: true,
          subtree: permissionsNodes,
        };
      });
    }
  ),

  // /**
  //  * State of tree for not modified permissions.
  //  * @type {Ember.ComputedPropert<Object>}
  //  */
  // persistedPermissionsTreeValues: computed(
  //   'persistedPermissions',
  //   'permissionsGroups',
  //   function () {
  //     const {
  //       persistedPermissions,
  //       permissionsGroups,
  //     } = this.getProperties('persistedPermissions', 'permissionsGroups');
  //     if (!persistedPermissions) {
  //       return [];
  //     } else {
  //       return permissionsGroups.reduce((tree, group) => {
  //         tree[group.groupName] = group.permissions.reduce((groupPerms, name) => {
  //           groupPerms[name] = persistedPermissions.indexOf(name) !== -1;
  //           return groupPerms;
  //         }, {});
  //         return tree;
  //       }, {});
  //     }
  // }),

  // treeOverrideValues: computed(
  //   'initialPermissions',
  //   'permissionsGroups',
  //   function () {
  //     this.privilegesArrayToTree(this.get('initialPermissions')) : undefined;
  //   }
  // ),

  modelProxyObserver: observer('modelProxy', function () {
    const modelProxy = this.get('modelProxy');
    if (!modelProxy.get('model')) {
      modelProxy.set('model', PromiseObject.create({
        promise: this.get('store')
          .findRecord('privilege', modelProxy.get('modelGri'))
          .then((privilegesModel) => {
            const privileges =
              privilegesArrayToObject(privilegesModel.get('privileges'), this.get('permissionsGroups'));
            modelProxy.setProperties({
              modifiedPermissions: privileges,
              persistedPermissions: privileges,
              overridePermissions: privileges,
            });
            return privilegesModel;
          }),
      }));
    }
  }),

  init() {
    this._super(...arguments);
    this.modelProxyObserver();
  },

  // privilegesArrayToGroupedTree(arr) {
  //   const permissionsGroups = this.get('permissionsGroups');
  //   return arr ? permissionsGroups.reduce((tree, group) => {
  //     tree[group.groupName] = group.permissions.reduce((groupPerms, name) => {
  //       groupPerms[name] = arr.indexOf(name) !== -1;
  //       return groupPerms;
  //     }, {});
  //     return tree;
  //   }, {}) : {};
  // },

  // privilegesArrayToFlatTree(arr) {
  //   const permissionsGroups = this.get('permissionsGroups');
  //   const privilegesNames = _.flatten(_.values(permissionsGroups));
  //   return arr ? privilegesNames.reduce((tree, privilegeName) => {
  //     tree[privilegeName] = arr.indexOf(privilegeName) !== -1;
  //     return tree;
  //   }, {}) : {};
  // },

  /**
   * Check if new values are changed by user
   * @param {object} newValues
   * @returns {boolean}
   */
  areValuesChanged(newValues) {
    const persistedPermissions = this.get('persistedPermissions');
    return !Object.keys(persistedPermissions).reduce((isEqual, groupName) => {
      return Object.keys(persistedPermissions[groupName]).reduce((isEq, privName) => {
        return isEq &&
          persistedPermissions[groupName][privName] === newValues[groupName][privName];
      }, isEqual);
    }, true);
  },

  actions: {
    treeValuesChanged(values) {
      const {
        modelProxy,
      } = this.getProperties(
        'modelProxy'
      );
      // values = _.assign({}, ..._.values(values));
      // values = Object.keys(values).filter(key => values[key]);
      // const permissions = this.areValuesChanged(values) ?
      //   values : persistedPermissions;
      modelProxy.set('modifiedPermissions', values);
      modelProxy.set('modified', this.areValuesChanged(values));
    },
  },
});
