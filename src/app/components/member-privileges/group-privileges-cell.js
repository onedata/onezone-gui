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
  classNames: ['group-privileges-cell', 'toggle-column', 'global'],
  tagName: 'td',

  /**
   * Input changed action.
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * Input focused out action.
   * @type {Function}
   */
  focusedOut: () => {},

  /**
   * Input classes.
   * @type {computed.string}
   */
  inputClass: computed('privilege', 'groupPrivileges', function inputClass() {
    return `field-${this.groupPrivileges}-${this.privilege} form-control`;
  }),

  state: computed('privilegesGrantedCount', 'allPrivilegesCount', function state() {
    if (
      this.privilegesGrantedCount &&
      this.privilegesGrantedCount < this.allPrivilegesCount
    ) {
      return 2;
    } else if (this.privilegesGrantedCount) {
      return true;
    }
    return false;
  }),

  privilegesGrantedCount: computed('privileges', function privilegesGrantedCount() {
    let privTrue = 0;
    for (const [key, value] of Object.entries(this.privileges)) {
      if (value) {
        privTrue++;
      }
    }
    return privTrue;
  }),

  allPrivilegesCount: computed('privileges', function allPrivilegesCount() {
    return Object.keys(this.privileges).length;
  }),

  isDirect: undefined,

  actions: {
    /**
     * Notifies about change in input.
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      if (this.get('value') !== value) {
        const parentName = this.groupPrivileges.name;
        const paths = [];
        for (const priv of this.groupPrivileges.subtree) {
          paths.push(parentName + '.' + priv.name);
        }
        if (value === 2) {
          this.get('inputChanged')(paths, true);
        } else {
          this.get('inputChanged')(paths, value);
        }
      }
    },

    /**
     * Notifies about an input focusOut event.
     */
    focusedOut(value) {
      this.get('focusedOut')(value);
    },
  },
});
