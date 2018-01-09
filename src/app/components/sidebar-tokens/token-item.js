/**
 * A first-level item component for tokens sidebar
 *
 * @module components/sidebar-tokens/token-item
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  /**
   * Shorter version of token
   * @type {Ember.ComputedProperty<string>}
   */
  shortToken: computed('item.token', function () {
    return shortenToken(this.get('item.token'));
  }),
});

/**
 * Creates shorter version of full client token.
 * @param {string} token 
 * @returns {string}
 */
function shortenToken(token) {
  return token.slice(0, 3) + '...' + token.slice(token.length - 12, token.length);
}
