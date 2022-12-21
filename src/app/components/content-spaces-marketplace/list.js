/**
 * Spaces in marketplace list with search.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  navigationState: service(),

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

  urlSelectedSpace: reads('navigationState.aspectOptions.selectedSpace'),

  didInsertElement() {
    this._super(...arguments);
    this.scrollToSelectedSpace();
  },

  scrollToSelectedSpace() {
    if (!this.urlSelectedSpace || !this.element) {
      return;
    }
    // /** @type {HTMLElement} */
    // const scrollElement = this.element.closest('.ps');
    const itemElement = this.element.querySelector(`[space-id=${this.urlSelectedSpace}]`);
    if (!itemElement) {
      return;
    }
    itemElement.scrollIntoView();
  },

  actions: {
    changeSearchValue(newValue) {
      debounce(this.viewModel, 'changeSearchValue', newValue, typingActionDebouce);
    },
  },
});
