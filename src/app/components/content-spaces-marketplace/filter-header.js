/**
 * An additional header with spaces list filtering options, inteted to use below
 * content header.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-filter-header'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.filterHeader',

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  tags: reads('viewModel.tagsFilter'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this.viewModel, 'changeSearchValue', newValue, typingActionDebouce);
    },
    changeTagsFilter(tags) {
      this.viewModel.changeTagsFilter(tags);
    },
  },
});
