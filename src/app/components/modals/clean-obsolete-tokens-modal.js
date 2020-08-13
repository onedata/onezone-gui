/**
 * A modal that is a confirmation of removing obsolete tokens. Allows to select
 * which obsolete tokens should be removed. Data needed from modalOptions:
 * * tokensToRemove - list with all tokens possible to remove
 * * selectedTokensToRemove - [optional] a list of preselected tokens (must be a
 *   subset of tokensToRemove). If not provided, then all tokens will be preselected.
 *
 * @module components/modals/clean-obsolete-tokens-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { array, raw } from 'ember-awesome-macros';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.cleanObsoleteTokensModal',

  /**
   * @virtual
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {Array<Models.Token>}
   */
  selectedTokensToRemove: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  tokensToRemove: reads('modalOptions.tokensToRemove'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  accessTokensToRemove: array.filterBy(
    'tokensToRemove',
    raw('typeName'),
    raw('access')
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  identityTokensToRemove: array.filterBy(
    'tokensToRemove',
    raw('typeName'),
    raw('identity')
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  inviteTokensToRemove: array.filterBy(
    'tokensToRemove',
    raw('typeName'),
    raw('invite')
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  selectedAccessTokensToRemove: array.filterBy(
    'selectedTokensToRemove',
    raw('typeName'),
    raw('access')
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  selectedIdentityTokensToRemove: array.filterBy(
    'selectedTokensToRemove',
    raw('typeName'),
    raw('identity')
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  selectedInviteTokensToRemove: array.filterBy(
    'selectedTokensToRemove',
    raw('typeName'),
    raw('invite')
  ),

  init() {
    this._super(...arguments);

    const selectedTokensToRemove = this.get('modalOptions.selectedTokensToRemove') ||
      this.get('tokensToRemove');
    this.set('selectedTokensToRemove', selectedTokensToRemove);
  },

  actions: {
    selectionChange(tokenType, newSelection) {
      const newSelectedTokensToRemove = this.get('selectedTokensToRemove')
        .filter(token => get(token, 'typeName') !== tokenType)
        .concat(newSelection);
      this.set('selectedTokensToRemove', newSelectedTokensToRemove);
    },
    submit(submitCallback) {
      const selectedTokensToRemove = this.get('selectedTokensToRemove');

      this.set('isSubmitting', true);
      return resolve(submitCallback(selectedTokensToRemove))
        .finally(() => safeExec(this, () => this.set('isSubmitting', false)));
    },
  },
});
