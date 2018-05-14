import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import _ from 'lodash';

export default Component.extend({
  classNames: ['permissions-tree-editor'],

  i18n: inject(),

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
   * Initial state of the permissions.
   * @type {Object}
   */
  initialPermissions: Object.freeze({}),

  /**
   * Actually saved permissions (used to show diff).
   * @type {Object}
   */
  actualPermissions: undefined,

  /**
   * @type {function}
   * @param {object} permissions permissions state. If not changed, the initial
   *   permissions object is passed
   * @returns {undefined}
   */
  // TODO rebase with develop, use ...ignore callback
  permissionsChanged: () => {},

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

  /**
   * State of tree for not modified permissions.
   * @type {Ember.ComputedPropert<Object>}
   */
  actualPermissionsTreeValues: computed(
    'actualPermissions',
    'permissionsGroups',
    function () {
      const {
        actualPermissions,
        permissionsGroups,
      } = this.getProperties('actualPermissions', 'permissionsGroups');
      if (!actualPermissions) {
        return [];
      } else {
        return permissionsGroups.reduce((tree, group) => {
          tree[group.groupName] = group.permissions.reduce((groupPerms, name) => {
            groupPerms[name] = actualPermissions[name];
            return groupPerms;
          }, {});
          return tree;
        }, {});
      }
  }),

  treeOverrideValues: computed(
    'initialPermissions',
    'permissionsGroups',
    function () {
      const {
        permissionsGroups,
        initialPermissions,
      } = this.getProperties(
        'permissionsGroups',
        'initialPermissions',
      );
      return initialPermissions ?
        permissionsGroups.reduce((tree, group) => {
          tree[group.groupName] = group.permissions.reduce((groupPerms, name) => {
            groupPerms[name] = initialPermissions[name];
            return groupPerms;
          }, {});
          return tree;
        }, {}) : undefined;
    }
  ),

  // actualPermissionsObserver: observer('actualPermissions', function () {
  //   const actualPermissions = this.get('actualPermissions');
  //   if (actualPermissions) {
  //     this.set('initialPermissions', actualPermissions);
  //   }
  // }),

  // init() {
  //   this._super(...arguments);
  //   this.actualPermissionsObserver();
  // },

  /**
   * Check if new values are changed by user
   * @param {object} newValues
   * @returns {boolean}
   */
  areValuesChanged(newValues) {
    const actualPermissions = this.get('actualPermissions');
    return actualPermissions ? !_.isEqual(newValues, actualPermissions) : false;
  },

  actions: {
    treeValuesChanged(values) {
      const {
        permissionsChanged,
        actualPermissions,
      } = this.getProperties('permissionsChanged', 'actualPermissions');
      values = _.assign({}, ..._.values(values));
      if (this.areValuesChanged(values)) {
        permissionsChanged(values);
      } else if (actualPermissions) {
        permissionsChanged(actualPermissions);
      }
    },
  },
});
