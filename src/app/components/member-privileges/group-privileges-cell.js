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

export default Component.extend({
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
   * Input changed action.
   * @virtual
   * @type {Function}
   */
  inputChanged: () => {},

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
  state: computed('privilegesGrantedCount', 'privilegesCount', function state() {
    if (
      this.privilegesGrantedCount &&
      this.privilegesGrantedCount < this.privilegesCount
    ) {
      return 2;
    } else if (this.privilegesGrantedCount) {
      return true;
    }
    return false;
  }),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  privilegesGrantedCount: computed('privileges', function privilegesGrantedCount() {
    let privTrue = 0;
    for (const value of Object.values(this.privileges)) {
      if (value === 2) {
        privTrue += 0.5;
      } else if (value) {
        privTrue++;
      }
    }
    return privTrue;
  }),

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
