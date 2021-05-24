/**
 * A support page for space
 *
 * @module components/content-spaces-support
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  i18nPrefix: 'components.contentSpacesSupport',

  /**
   * @type {models/Space}
   */
  space: undefined,

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasAddSupportPrivilege: computed(
    'space.currentUserEffPrivileges',
    function hasAddSupportPrivilege() {
      const currentUserEffPrivileges = this.get('space.currentUserEffPrivileges');
      return currentUserEffPrivileges.includes('space_add_support');
    }
  ),

});
