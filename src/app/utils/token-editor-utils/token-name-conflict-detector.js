/**
 * A util which tells if specific token name is already occupied.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { promise } from 'ember-awesome-macros';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';

export default EmberObject.extend(OwnerInjector, {
  tokenManager: service(),

  /**
   * @private
   * @type {ComputedProperty<PromiseArray<DS.RecordArray<Models.Token>>>}
   */
  allTokens: promise.object(computed(async function allTokens() {
    return get(await this.tokenManager.getTokens(), 'list');
  })),

  /**
   * @public
   * @type {ComputedProperty<Array<string>>}
   */
  allTokenNames: computed('allTokens.content.@each.name', function allTokenNames() {
    return this.allTokens.content
      ?.map((token) => get(token, 'name')).filter(Boolean) ?? [];
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    // Load tokens
    this.allTokens;
  },

  /**
   * @public
   * @param {string} name
   * @param {Models.Token | null} [forToken] When passed, then `nameToCheck` is
   *   considered a (new) name for `forToken`. If `nameToCheck` conflicts with
   *   the current name of the `forToken`, then it is still valid.
   * @returns {boolean}
   */
  isNameConflicting(nameToCheck, forToken = null) {
    const ignoreName = forToken ? get(forToken, 'name') : null;

    const trimmedNameToCheck = nameToCheck.trim();
    if (trimmedNameToCheck === ignoreName) {
      return false;
    }

    return this.allTokenNames.includes(trimmedNameToCheck);
  },
});
