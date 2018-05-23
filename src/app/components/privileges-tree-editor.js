/**
 * Privileges tree editor component.
 *
 * @module components/privileges-tree-editor
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { A } from '@ember/array';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';

export default Component.extend({
  classNames: ['privileges-tree-editor'],

  i18n: inject(),
  store: inject(),

  /**
   * @type {array<object>}
   */
  privilegesGroups: Object.freeze([]),

  /**
   * Path to the translations of privilege groups names
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of privileges names
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * Model with privileges.
   */
  modelProxy: Object.freeze({}),

  /**
   * If false, edition will be not available.
   * @type {boolean}
   */
  editionEnabled: true,

  /**
   * First overridePrivileges.
   * @type {Object}
   */
  initialPrivileges: undefined,

  /**
   * State of the privileges, which will override tree state on change.
   * @type {Object}
   */
  overridePrivileges: reads('modelProxy.overridePrivileges'),

  /**
   * Actually saved privileges (used to show diff).
   * @type {Object}
   */
  persistedPrivileges: reads('modelProxy.persistedPrivileges'),

  /**
   * @type {Ember.ComputedProperty<array<object>}
   */
  initialTreeState: computed(
    'initialPrivileges',
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    function () {
      const {
        initialPrivileges,
        privilegesGroups,
        privilegeGroupsTranslationsPath,
        privilegesTranslationsPath,
        i18n,
      } = this.getProperties(
        'initialPrivileges',
        'privilegesGroups',
        'privilegeGroupsTranslationsPath',
        'privilegesTranslationsPath',
        'i18n'
      );
      return privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          const threeStatePermission =
            initialPrivileges[groupName][privilege] === 2;
          return {
            name: privilege,
            text: i18n.t(privilegesTranslationsPath + '.' + privilege),
            field: {
              type: 'checkbox',
              threeState: threeStatePermission,
              allowThreeStateToggle: threeStatePermission,
            },
          };
        });
        return {
          name: groupName,
          text: i18n.t(privilegeGroupsTranslationsPath + '.' + groupName),
          allowSubtreeCheckboxSelect: true,
          subtree: privilegesNodes,
        };
      });
    }
  ),

  treeDisabledPaths: computed('editionEnabled', 'privilegesGroups', function () {
    const { 
      editionEnabled,
      privilegesGroups,
    } = this.getProperties('editionEnabled', 'privilegesGroups');
    return editionEnabled ? A() : A(privilegesGroups.map(g => g.groupName));
  }),

  // /**
  //  * State of tree for not modified privileges.
  //  * @type {Ember.ComputedPropert<Object>}
  //  */
  // persistedPrivilegesTreeValues: computed(
  //   'persistedPrivileges',
  //   'privilegesGroups',
  //   function () {
  //     const {
  //       persistedPrivileges,
  //       privilegesGroups,
  //     } = this.getProperties('persistedPrivileges', 'privilegesGroups');
  //     if (!persistedPrivileges) {
  //       return [];
  //     } else {
  //       return privilegesGroups.reduce((tree, group) => {
  //         tree[group.groupName] = group.privileges.reduce((groupPerms, name) => {
  //           groupPerms[name] = persistedPrivileges.indexOf(name) !== -1;
  //           return groupPerms;
  //         }, {});
  //         return tree;
  //       }, {});
  //     }
  // }),

  // treeOverrideValues: computed(
  //   'initialPrivileges',
  //   'privilegesGroups',
  //   function () {
  //     this.privilegesArrayToTree(this.get('initialPrivileges')) : undefined;
  //   }
  // ),

  overridePrivilegesObserver: observer('overridePrivileges', function () {
    const {
      overridePrivileges,
      initialPrivileges,
    } = this.getProperties('overridePrivileges', 'initialPrivileges');
    if (!initialPrivileges && overridePrivileges) {
      this.set('initialPrivileges', overridePrivileges);
    }
  }),

  modelProxyObserver: observer('modelProxy', function () {
    const modelProxy = this.get('modelProxy');
    if (!modelProxy.get('model')) {
      modelProxy.set('model', PromiseObject.create({
        promise: this.get('store')
          .findRecord('privilege', modelProxy.get('modelGri'))
          .then((privilegesModel) => {
            const privileges =
              privilegesArrayToObject(privilegesModel.get('privileges'), this.get('privilegesGroups'));
            modelProxy.setProperties({
              modifiedPrivileges: privileges,
              persistedPrivileges: privileges,
              overridePrivileges: privileges,
            });
            return privilegesModel;
          }),
      }));
    }
  }),

  init() {
    this._super(...arguments);
    this.overridePrivilegesObserver();
    this.modelProxyObserver();
  },

  // privilegesArrayToGroupedTree(arr) {
  //   const privilegesGroups = this.get('privilegesGroups');
  //   return arr ? privilegesGroups.reduce((tree, group) => {
  //     tree[group.groupName] = group.privileges.reduce((groupPerms, name) => {
  //       groupPerms[name] = arr.indexOf(name) !== -1;
  //       return groupPerms;
  //     }, {});
  //     return tree;
  //   }, {}) : {};
  // },

  // privilegesArrayToFlatTree(arr) {
  //   const privilegesGroups = this.get('privilegesGroups');
  //   const privilegesNames = _.flatten(_.values(privilegesGroups));
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
    const persistedPrivileges = this.get('persistedPrivileges');
    return !Object.keys(persistedPrivileges).reduce((isEqual, groupName) => {
      return Object.keys(persistedPrivileges[groupName]).reduce((isEq, privName) => {
        return isEq &&
          persistedPrivileges[groupName][privName] === newValues[groupName][privName];
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
      // const privileges = this.areValuesChanged(values) ?
      //   values : persistedPrivileges;
      modelProxy.set('modifiedPrivileges', values);
      modelProxy.set('modified', this.areValuesChanged(values));
    },
  },
});
