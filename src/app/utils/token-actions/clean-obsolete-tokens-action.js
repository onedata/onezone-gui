/**
 * Allows to remove disabled tokens from passed list of tokens.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { isEmpty, conditional } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  tokenManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.tokenActions.cleanObsoleteTokensAction',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @override
   */
  icon: 'clean-filled',

  /**
   * @override
   */
  tip: conditional(
    'tokensToRemove.length',
    computedT('tipSomethingToClean'),
    computedT('tipNothingToClean')
  ),

  /**
   * @override
   */
  className: 'clean-obsolete-tokens-trigger',

  /**
   * @override
   */
  disabled: isEmpty('tokensToRemove'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  allTokens: reads('context.sortedCollection'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  visibleTokens: reads('context.visibleCollection'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  tokensToRemove: computed('allTokens.@each.isObsolete', function tokensToRemove() {
    return this.allTokens?.filter((token) => token.isObsolete) ?? [];
  }),

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
        .show('clean-obsolete-tokens-modal', {
          tokensToRemove,
          selectedTokensToRemove,
          onSubmit: (userSelectedTokens) =>
            result.interceptPromise(this.removeTokens(userSelectedTokens)),
        }).hiddenPromise
        .then(() => {
          result.cancelIfPending();
          this.notifyResult(result);
          return result;
        });
    }
  },

  /**
   * @param {Array<Models.Token>} tokens
   * @returns {Promise}
   */
  async removeTokens(tokens) {
    const tokenManager = this.tokenManager;

    let results = [];
    try {
      results = await tokenManager.deleteTokens(...tokens.map(token => token.id));
    } catch (reason) {
      results.push([{ state: 'rejected', reason }]);
    }
    const errorResults = results.filter(it => it.state === 'rejected');
    if (errorResults.length) {
      throw errorResults[0].reason;
    } else {
      return results.map(it => it.value);
    }
  },
});
