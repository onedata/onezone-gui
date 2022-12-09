import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.list',

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  /**
   * @type {ComputedProperty<Array<SpaceMarketplaceData>>}
   */
  filteredCollection: reads('viewModel.filteredCollection'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this.viewModel, 'changeSearchValue', newValue, typingActionDebouce);
    },
  },
});
