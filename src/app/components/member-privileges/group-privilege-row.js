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
  tagName: 'tr',
  classNames: ['group-privilege-row'],

  /**
   * @virtual
   * @type {Object}
   */
  privileges: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  effPrivileges: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  groupPrivileges: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  oldPrivileges: undefined,

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
   * Input changed action.
   * @virtual
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * Input focused out action.
   * @virtual
   * @type {Function}
   */
  focusedOut: () => {},

  /**
   * @virtual
   * @type {Function}
   */
  changeOpenGroup: () => {},

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  allPrivilegesCount: computed('privileges', function allPrivilegesCount() {
    return Object.keys(this.privileges).length;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isModified: computed('oldPrivileges', 'privileges', function isModified() {
    for (const [key, value] of Object.entries(this.privileges)) {
      if (this.oldPrivileges[key] !== value) {
        return true;
      }
    }
    return false;
  }),

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
