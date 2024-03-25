/**
 * Show row with group privileges for direct member.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['group-privilege-row'],

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.groupPrivilegeRow',

  /**
   * @virtual
   * @type {Object<string,boolean>}
   */
  privileges: undefined,

  /**
   * @virtual
   * @type {Object<string,boolean>}
   */
  effectivePrivilegeValues: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  privilegesGroup: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  previousDirectPrivilegeValues: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isDirect: true,

  /**
   * @virtual
   * @type {boolean}
   */
  isOpen: false,

  /**
   * @virtual
   * @type {boolean}
   */
  editionEnabled: true,

  /**
   * @virtual
   * @type {Object}
   */
  form: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isBulkEdit: false,

  /**
   * @virtual
   * @type {boolean}
   */
  hasUnsavedPrivileges: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  arePrivilegesUpToDate: true,

  /**
   * @type {number}
   */
  newGrantedEffPrivCountCache: undefined,

  isUnknownEffPrivStatusCache: undefined,

  /**
   * Input changed action.
   * @virtual
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * @virtual
   * @type {Function}
   */
  changeOpenGroup: () => {},

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  privilegesCount: computed('privileges', function privilegesCount() {
    if (this.privileges) {
      return Object.keys(this.privileges).length;
    }
    return 0;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isModified: computed(
    'previousDirectPrivilegeValues',
    'privileges',
    'hasUnsavedPrivileges',
    function isModified() {
      if (this.hasUnsavedPrivileges &&
        this.privileges && this.previousDirectPrivilegeValues
      ) {
        for (const [key, value] of Object.entries(this.privileges)) {
          if (this.previousDirectPrivilegeValues[key] !== value) {
            return true;
          }
        }
      }
      return false;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  newGrantedEffPrivCount: computed(
    'previousDirectPrivilegeValues',
    'privileges',
    'effectivePrivilegeValues',
    'arePrivilegesUpToDate',
    'isModified',
    function newGrantedEffPrivCount() {
      if (!this.arePrivilegesUpToDate && this.newGrantedEffPrivCountCache !== undefined) {
        return this.newGrantedEffPrivCountCache;
      }
      let result = 0;
      if (this.privileges && this.previousDirectPrivilegeValues) {
        for (const [key, value] of Object.entries(this.privileges)) {
          if (this.effectivePrivilegeValues[key]) {
            result += 1;
          } else if (this.isModified &&
            this.previousDirectPrivilegeValues[key] !== value
          ) {
            if (value && !this.effectivePrivilegeValues[key]) {
              result += 1;
            }
          }
        }
      }
      this.set('newGrantedEffPrivCountCache', result);
      return result;
    }
  ),

  isUnknownEffPrivStatus: computed(
    'previousDirectPrivilegeValues',
    'privileges',
    'effectivePrivilegeValues',
    'arePrivilegesUpToDate',
    'isModified',
    function isUnknownEffPrivStatus() {
      if (!this.arePrivilegesUpToDate && this.isUnknownEffPrivStatusCache !== undefined) {
        return this.isUnknownEffPrivStatusCache;
      }
      if (this.isModified && this.privileges && this.previousDirectPrivilegeValues) {
        for (const [key, value] of Object.entries(this.privileges)) {
          if (this.previousDirectPrivilegeValues[key] !== value) {
            if (!value && this.effectivePrivilegeValues[key]) {
              this.set('isUnknownEffPrivStatusCache', true);
              return true;
            }
          }
        }
      }
      this.set('isUnknownEffPrivStatusCache', false);
      return false;
    }
  ),

  actions: {
    /**
     * Notifies about change in input.
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      if (this.get('value') !== value) {
        const parentName = this.privilegesGroup.name;
        const paths = [];
        for (const priv of this.privilegesGroup.subtree) {
          paths.push(parentName + '.' + priv.name);
        }
        this.inputChanged(paths, Boolean(value));
      }
    },

    changeOpenGroup() {
      this.get('changeOpenGroup')();
    },
  },
});
