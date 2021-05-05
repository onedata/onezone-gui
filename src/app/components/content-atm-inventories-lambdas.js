/**
 * Allows to view and create lambdas for automation inventory.
 *
 * @module components/content-atm-inventories-lambdas
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { conditional, array } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(GlobalActions, {
  classNames: ['content-atm-inventories-lambdas'],

  navigationState: service(),

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * Mapping:
   * string -> Array<Utils.Action>
   * @type {Object}
   */
  actionsPerSlide: undefined,

  /**
   * @type {Array<String>}
   */
  possibleSlideIds: Object.freeze(['list', 'creator']),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  activeSlideFromUrl: reads('navigationState.aspectOptions.view'),

  /**
   * @type {ComputedProperty<String>}
   */
  activeSlide: conditional(
    array.includes('possibleSlideIds', 'activeSlideFromUrl'),
    'activeSlideFromUrl',
    'possibleSlideIds.firstObject'
  ),

  /**
   * @override
   */
  globalActions: computed('actionsPerSlide', 'activeSlide', function globalActions() {
    const {
      actionsPerSlide,
      activeSlide,
    } = this.getProperties('actionsPerSlide', 'activeSlide');

    return actionsPerSlide[activeSlide];
  }),

  changeSlideViaUrl(newSlide) {
    this.get('navigationState').changeRouteAspectOptions({
      view: newSlide,
    });
  },

  init() {
    this._super(...arguments);
    this.set('actionsPerSlide', {});
  },

  actions: {
    showListView() {
      this.changeSlideViaUrl('list');
    },
    showCreatorView() {
      this.changeSlideViaUrl('creator');
    },
    registerViewActions(slideId, actions) {
      this.set('actionsPerSlide', Object.assign({}, this.get('actionsPerSlide'), {
        [slideId]: actions,
      }));
    },
  },
});
