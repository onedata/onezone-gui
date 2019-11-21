/**
 * Allows to remove disabled tokens from passed list of tokens.
 *
 * @module utils/token-actions/remove-disabled-tokens-action
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { raw, array, isEmpty } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { reject, allSettled } from 'rsvp';

export default Action.extend({
  tokenManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.tokenActions.removeDisabledTokensAction',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @override
   */
  icon: 'remove',

  /**
   * @override
   */
  tip: computedT('tip'),

  /**
   * @override
   */
  classNames: 'remove-disabled-tokens-trigger',

  /**
   * @override
   */
  disabled: isEmpty('tokensToRemove'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  allTokens: reads('context.allTokens'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  visibleTokens: reads('context.visibleTokens'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  tokensToRemove: array.rejectBy('allTokens', raw('isActive')),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  selectedTokensToRemove: computed(
    'visibleTokens.[]',
    'tokensToRemove.[]',
    function checkedTokensToRemove() {
      const {
        visibleTokens,
        tokensToRemove,
      } = this.getProperties('visibleTokens', 'tokensToRemove');

      if (!visibleTokens) {
        return tokensToRemove;
      } else {
        return visibleTokens.filter(token => tokensToRemove.includes(token));
      }
    }
  ),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        tokensToRemove,
        selectedTokensToRemove,
        modalManager,
      } = this.getProperties(
        'tokensToRemove',
        'selectedTokensToRemove',
        'modalManager'
      );

      const result = ActionResult.create();
      return modalManager
        .show('remove-disabled-tokens', {
          tokensToRemove,
          selectedTokensToRemove,
          onSubmit: (userSelectedTokens) =>
            result.interceptPromise(this.removeTokens(userSelectedTokens)),
        }).hiddenPromise
        .then(() => this.notifyResult(result))
        .then(() => result);
    }
  },

  /**
   * @param {Array<Models.Token>} tokens
   * @returns {Promise}
   */
  removeTokens(tokens) {
    const tokenManager = this.get('tokenManager');
    return allSettled(tokens.map(token => tokenManager.deleteToken(token)))
      .then(results => tokenManager.reloadList()
        .then(() => results)
        .catch(reason => [{ state: 'rejected', reason }])
      )
      .then(results => {
        const errorResults = results.filterBy('state', 'rejected');
        if (errorResults.length) {
          return reject(errorResults[0].reason);
        } else {
          return results.mapBy('value');
        }
      });
  },
});
