// FIXME: jsdoc

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
