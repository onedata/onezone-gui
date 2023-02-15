// FIXME: jsdoc

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { or, not } from 'ember-awesome-macros';

export default Component.extend({
  classNames: ['spaces-marketplace-header'],

  /**
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  someSpacesAvailable: not(or(
    'viewModel.entriesInitialLoad.isPending',
    'viewModel.noSpacesAvailable'
  )),

  isFilterHeaderShown: reads('someSpacesAvailable'),
});
