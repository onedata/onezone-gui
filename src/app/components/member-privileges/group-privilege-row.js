/**
 * Show row with group privileges for direct member.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['group-privileges-row'],
  tagName: 'tr',

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

  changeOpenGroup: () => {},

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
    for (const value of Object.values(this.privileges)) {
      if (value) {
        privTrue++;
      }
    }
    return privTrue;
  }),

  effPrivilegesGrantedCount: computed('effPrivileges', function effPrivilegesGrantedCount() {
    let privTrue = 0;
    for (const value of Object.values(this.effPrivileges)) {
      if (value) {
        privTrue++;
      }
    }
    return privTrue;
  }),

  allPrivilegesCount: computed('privileges', function allPrivilegesCount() {
    return Object.keys(this.privileges).length;
  }),

  isModified: computed('oldPrivileges', 'privileges', function isModified() {
    for (const [key, value] of Object.entries(this.privileges)) {
      if (this.oldPrivileges[key] !== value) {
        return true;
      }
    }
    return false;
  }),

  oldPrivileges: undefined,

  isDirect: true,

  isOpen: false,

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

    changeOpenGroup() {
      this.get('changeOpenGroup')();
    },
  },
});
