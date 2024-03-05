/**
 * Show row in table for member for single privileges.
 * This includes such cell like: name privileges, toggle to change direct privilege and
 * status for effective privileges.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * @typedef {Object} PrivilegeInfo
 * @property {string} name
 * @property {SafeString} text
 * @property {PrivilegeField} field
 */

/**
 * @typedef {Object} PrivilegeField
 * @property {boolean} allowThreeStateToggle
 * @property {boolean} threeState
 * @property {string} type
 */

export default Component.extend(DisabledPaths, I18n, {
  tagName: 'tr',
  classNames: ['privilege-row'],
  classNameBindings: [
    'isDirect:direct-member-privilege-row:effective-member-privilege-row',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.privilegeRow',

  /**
   * @virtual
   * @type {PrivilegeInfo}
   */
  privilege: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  directPrivilegeValue: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  effectivePrivilegeValue: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  previousDirectPrivilegeValue: undefined,

  /**
   * @virtual
   * @type {string}
   */
  privilegesGroupName: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isDirect: false,

  /**
   * @virtual
   * @type {boolean}
   */
  isBulkEdit: false,

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
   * @virtual optional
   * @type {boolean}
   */
  arePrivilegesReloaded: true,

  /**
   * Input changed action.
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * Input classes.
   * @type {Ember.ComputedProperty<string>}
   */
  inputClass: computed('privilegesGroupName', function inputClass() {
    return `field-${this.privilegesGroupName} form-control`;
  }),

  isModifiedPriv: computed(
    'previousDirectPrivilegeValue',
    'directPrivilegeValue',
    function isModifiedPriv() {
      return this.previousDirectPrivilegeValue !== this.directPrivilegeValue;
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isDisplayedEffectivePrivGranted: computed(
    'directPrivilegeValue',
    'effectivePrivilegeValue',
    'isModifiedPriv',
    'arePrivilegesReloaded',
    function isDisplayedEffectivePrivGranted() {
      return this.directPrivilegeValue ||
        ((!this.isModifiedPriv && this.arePrivilegesReloaded) &&
          this.effectivePrivilegeValue);
    }
  ),

  actions: {
    /**
     * Notifies about change in input.
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      if (this.get('value') !== value) {
        this.get('inputChanged')(value);
      }
    },
  },
});
