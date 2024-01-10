/**
 * Show row in table for direct member for single privileges.
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

export default Component.extend(DisabledPaths, I18n, {
  classNames: ['privilege-row'],
  classNameBindings: [
    'isDirect:direct-member-privilege-row:effective-member-privilege-row',
  ],
  tagName: 'tr',

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.privilegeRow',

  privilege: undefined,

  directPrivilege: undefined,

  effectivePrivilege: undefined,

  groupPrivileges: undefined,

  isDirect: false,

  isBulkEdit: false,

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

    /**
     * Notifies about an input focusOut event.
     */
    focusedOut(value) {
      this.get('focusedOut')(value);
    },
  },
});
