/**
 * Non-empty marketplace aspect content (header, spaces list etc.).
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import { collect } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.content',

  // TODO: VFS-10263 make "Add your space" action available in mobile mode
  globalActions: collect('chooseSpaceToAdvertiseAction'),

  viewModel: undefined,

  chooseSpaceToAdvertiseAction: computed(function chooseSpaceToAdvertiseAction() {
    return this.spaceActions.createChooseSpaceToAdvertiseAction();
  }),
});
