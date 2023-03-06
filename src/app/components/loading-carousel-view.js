/**
 * Shows loading state (including loading errors). It is a whole view
 * component - may be used for a full page carousel.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties, get } from '@ember/object';
import { or, getBy, raw } from 'ember-awesome-macros';

/**
 * @typedef {Object} LoadingCarouselViewHeaderTexts
 * @property {string} loading
 * @property {string} notFound
 * @property {string} forbidden
 * @property {string} otherError
 */

export default Component.extend({
  classNames: ['loading-carousel-view'],

  /**
   * @virtual
   * @type {PromiseProxy}
   */
  loadingProxy: undefined,

  /**
   * @virtual
   * @type {string}
   */
  backResourceIcon: undefined,

  /**
   * @virtual
   * @type {LoadingCarouselViewHeaderTexts}
   */
  headerTexts: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: undefined,

  /**
   * One of: `'loading'`, `'notFound'`, `'forbidden'`, `'otherError'`, `'loaded'`
   * @type {ComputedProperty<string>}
   */
  state: computed('loadingProxy.isPending', function state() {
    const {
      isPending,
      isRejected,
      reason,
    } = getProperties(
      this.get('loadingProxy') || {},
      'isPending',
      'isRejected',
      'reason'
    );

    if (isPending) {
      return 'loading';
    } else if (isRejected) {
      const errorId = reason && get(reason, 'id');
      if (errorId === 'notFound' || errorId === 'forbidden') {
        return errorId;
      }
      return 'otherError';
    }
    return 'loaded';
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  headerText: or(getBy('headerTexts', 'state'), raw('')),

  actions: {
    backSlide() {
      const onBackSlide = this.get('onBackSlide');
      onBackSlide && onBackSlide();
    },
  },
});
