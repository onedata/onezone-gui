/**
 * Allows to remove disabled tokens from passed list of tokens.
 *
 * @module utils/token-actions/clean-obsolete-tokens-action
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { raw, array, isEmpty, conditional } from 'ember-awesome-macros';
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
  i18nPrefix: 'utils.tokenActions.cleanObsoleteTokensAction',

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
  tip: conditional(
    'tokensToRemove.length',
    computedT('tipSomethingToClean'),
    computedT('tipNothingToClean')
  ),

  /**
   * @override
   */
  classNames: 'clean-obsolete-tokens-trigger',

  /**
   * @override
   */
  disabled: isEmpty('tokensToRemove'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  allTokens: reads('context.collection'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  visibleTokens: reads('context.visibleCollection'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  tokensToRemove: array.filterBy('allTokens', raw('isObsolete')),

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
  removeTokens(tokens) {
    const tokenManager = this.get('tokenManager');
    return allSettled(tokens.map(token => tokenManager.deleteToken(get(token, 'id'))))
      .then(results => tokenManager.reloadList()
        .then(() => results)
        .catch(reason => (results || []).concat([{ state: 'rejected', reason }]))
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
