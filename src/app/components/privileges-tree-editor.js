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
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';

/**
 * @typedef {EmberObject} PrivilegesModelProxy
 * @property {DS.Model} subject subject of privileges
 *   (e.g. shared-user of shared-group)
 * @property {string} modelGri gri of privileges model
 * @property {DS.Model} model privileges model
 * @property {boolean} modified are privileges modified (has unsaved changes)
 * @property {boolean} saving is model saving now
 * @property {Object} persistedPrivileges tree of privileges, that are saved
 *   (state before privileges change)
 * @property {Object} modifiedPrivileges tree of privileges, that contains actual
 *   state with modifications (== persistedPrivileges after user changes)
 * @property {Object} overridePrivileges tree of privileges, that should override
 *   actual state of tree component values (for example used to reset tree)
 */

export default Component.extend({
  classNames: ['privileges-tree-editor'],

  i18n: service(),
  store: service(),

  /**
   * Grouped privileges used to construct tree nodes
   * @type {Array<Object>}
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
   * @type {PrivilegesModelProxy}
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
   * Tree definition
   * @type {Ember.ComputedProperty<Array<Object>>}
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

  /**
   * Tree paths, which are disabled for edition. Used to block tree edition.
   * @type {Ember.ComputedProperty<Ember.Array<string>>}
   */
  treeDisabledPaths: computed('editionEnabled', 'privilegesGroups', function () {
    const {
      editionEnabled,
      privilegesGroups,
    } = this.getProperties('editionEnabled', 'privilegesGroups');
    return editionEnabled ? A() : A(privilegesGroups.map(g => g.groupName));
  }),

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
    if (!get(modelProxy, 'model')) {
      // load model from backend if empty
      modelProxy.set('model', PromiseObject.create({
        promise: this.get('store')
          .findRecord('privilege', get(modelProxy, 'modelGri'))
          .then((privilegesModel) => {
            const privileges = privilegesArrayToObject(
              get(privilegesModel, 'privileges'),
              this.get('privilegesGroups')
            );
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

  /**
   * Checks if new values are changed by user (differ from persistedPrivileges)
   * @param {object} newValues new tree of privileges
   * @returns {boolean}
   */
  areValuesChanged(newValues) {
    const persistedPrivileges = this.get('persistedPrivileges');
    return !Object.keys(persistedPrivileges).reduce((isEqual, groupName) => {
      return Object.keys(persistedPrivileges[groupName]).reduce((isEq, privName) => {
        return isEq &&
          persistedPrivileges[groupName][privName] ===
          newValues[groupName][privName];
      }, isEqual);
    }, true);
  },

  actions: {
    treeValuesChanged(values) {
      this.get('modelProxy').setProperties({
        modifiedPrivileges: values,
        modified: this.areValuesChanged(values),
      });
    },
  },
});
