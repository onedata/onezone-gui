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
    function isModified() {
      if (this.privileges && this.previousDirectPrivilegeValues) {
        for (const [key, value] of Object.entries(this.privileges)) {
          if (this.previousDirectPrivilegeValues[key] !== value) {
            return true;
          }
        }
      }
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
