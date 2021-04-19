import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { conditional, array } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['content-workflows-functions'],

  navigationState: service(),

  /**
   * @virtual
   * @type {Models.WorkflowDirectory}
   */
  workflowDirectory: undefined,

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

  changeSlideViaUrl(newSlide) {
    this.get('navigationState').changeRouteAspectOptions({
      view: newSlide,
    });
  },

  actions: {
    showListView() {
      this.changeSlideViaUrl('list');
    },
    showCreatorView() {
      this.changeSlideViaUrl('creator');
    },
  },
});
