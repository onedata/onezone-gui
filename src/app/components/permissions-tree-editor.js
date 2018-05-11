import Component from '@ember/component';
import { computed, observer } from '@ember/object';
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
   * Actually saved permissions.
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
    'initialPermissions',
    'permissionsGroups',
    'permissionGroupsTranslationsPath',
    'permissionsTranslationsPath',
    function () {
      const {
        initialPermissions,
        permissionsGroups,
        permissionGroupsTranslationsPath,
        permissionsTranslationsPath,
        i18n,
      } = this.getProperties(
        'initialPermissions',
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
            defaultValue: initialPermissions[permission],
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

  actualPermissionsObserver: observer('actualPermissions', function () {
    const actualPermissions = this.get('actualPermissions');
    if (actualPermissions) {
      this.set('initialPermissions', actualPermissions);
    }
  }),

  init() {
    this._super(...arguments);
    this.actualPermissionsObserver();
  },

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
