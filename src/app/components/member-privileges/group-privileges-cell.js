/**
 * Show cell with group privileges status for effective privileges or toggle to edit for
 * direct privileges group.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

export default Component.extend(I18n, {
  tagName: 'td',
  classNames: ['group-privileges-cell', 'toggle-column', 'group'],

  /**
   * @virtual
   * @type {Object}
   */
  privileges: undefined,

  /**
   * @virtual
   * @type {string}
   */
  groupPrivilegeName: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  editionEnabled: true,

  /**
   * @virtual
   * @type {boolean}
   */
  isDirect: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  form: undefined,

  /**
   * @virtual
   * @type {number}
   */
  newGrantedEffPrivCount: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isUnknownEffPrivStatus: false,

  /**
   * @virtual
   * @type {string}
   */
  targetRecordType: '',

  /**
   * @virtual optional
   * @type {boolean}
   */
  arePrivilegesUpToDate: true,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isPrivilegesToggleDisabled: false,

  /**
   * Input changed action.
   * @virtual
   * @type {Function}
   */
  inputChanged: () => {},

  insufficientPrivilegesTip: computed(
    'targetRecordType',
    function insufficientPrivilegesTip() {
      let modelName;
      if (this.targetRecordType === 'atm_inventory') {
        modelName = 'atmInventory';
      } else {
        modelName = this.targetRecordType;
      }
      return insufficientPrivilegesMessage({
        i18n: this.i18n,
        modelName,
        privilegeFlag: `${this.targetRecordType}_set_privileges`,
      });
    }
  ),

  /**
   * Input classes.
   * @type {Ember.ComputedProperty<string>}
   */
  inputClass: computed('groupPrivilegeName', function inputClass() {
    return `field-${this.groupPrivilegeName} form-control`;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  state: computed(
    'isUnknownEffPrivStatus',
    'privilegesGrantedCount',
    'privilegesCount',
    function state() {
      if (
        (this.privilegesGrantedCount &&
          this.privilegesGrantedCount < this.privilegesCount) ||
        this.isUnknownEffPrivStatus
      ) {
        return 2;
      } else if (this.privilegesGrantedCount) {
        return true;
      }
      return false;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  privilegesGrantedCount: computed(
    'privileges',
    'newGrantedEffPrivCount',
    'isUnknownEffPrivStatus',
    'isDirect',
    function privilegesGrantedCount() {
      let privTrue = 0;
      if (this.isDirect) {
        for (const value of Object.values(this.privileges)) {
          if (value === 2) {
            return 0.5;
          } else if (value) {
            privTrue++;
          }
        }
        return privTrue;
      }
      if (this.isUnknownEffPrivStatus) {
        return -1;
      }
      return this.newGrantedEffPrivCount;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<number|string>}
   */
  grantedText: computed(
    'privilegesGrantedCount',
    'isUnknownEffPrivStatus',
    'arePrivilegesUpToDate',
    function grantedText() {
      if (this.isUnknownEffPrivStatus) {
        return '?';
      } else {
        return this.privilegesGrantedCount;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  privilegesCount: computed('privileges', function privilegesCount() {
    return Object.keys(this.privileges).length;
  }),

  actions: {
    /**
     * Notifies about change in input.
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      this.get('inputChanged')(value);
    },
  },
});
