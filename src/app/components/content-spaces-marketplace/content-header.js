/**
 * A header typical for content views intended for Space Marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { collect, conditional } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import Action from 'onedata-gui-common/utils/action';

export default Component.extend(I18n, {
  classNames: ['row', 'content-row', 'header-row', 'hidden-xs', 'has-border'],

  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.contentHeader',

  // TODO: VFS-10263 make "Add your space" and refresh actions available in mobile mode
  actionsArray: conditional(
    'viewModel.showEmptyListView',
    collect('refreshAdvertisedSpacesListAction'),
    collect('chooseSpaceToAdvertiseAction', 'refreshAdvertisedSpacesListAction'),
  ),

  /**
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  chooseSpaceToAdvertiseAction: computed(function chooseSpaceToAdvertiseAction() {
    return this.spaceActions.createChooseSpaceToAdvertiseAction();
  }),

  refreshAdvertisedSpacesListAction: computed(
    'viewModel',
    function refreshAdvertisedSpacesListAction() {
      return Action
        .extend({
          disabled: reads('viewModel.isRefreshing'),
        }).create({
          viewModel: this.viewModel,
          ownerSource: this,
          i18nPrefix: `${this.i18nPrefix}.refreshAdvertisedSpacesListAction`,
          className: 'refresh-advertised-spaces-list',
          icon: 'refresh',
          onExecute: async () => {
            return await this.viewModel.refreshList();
          },
        });
    }
  ),
});
