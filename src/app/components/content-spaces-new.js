/**
 * A create new space view
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject } from '@ember/service';
import globals from 'onedata-gui-common/utils/globals';

export default Component.extend(I18n, {
  spaceActions: inject(),

  i18nPrefix: 'components.contentSpacesNew',

  /**
   * A space name updated by input element
   * @type {string}
   * @private
   */
  spaceName: undefined,

  didInsertElement() {
    globals.document.getElementById('new-space-name').focus();
  },

  actions: {
    createSpace() {
      const spaceName = this.get('spaceName');
      return this.get('spaceActions').createSpace({ name: spaceName });
    },
  },
});
