/**
 * A modal that is a confirmation of removing disabled tokens. Allows to select
 * which disabled tokens should be removed. Data needed from modalOptions:
 * * tokensToRemove - list with all tokens possible to remove
 * * selectedTokensToRemove - [optional] a list of preselected tokens (must be a
 *   subset of tokensToRemove). If not provided, then all tokens will be preselected.
 *
 * @module components/modals/remove-disabled-tokens
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { array, raw } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import _ from 'lodash';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.removeDisabledTokens',

  /**
   * @virtual
   */
  modalOptions: undefined,

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
      const {
        selectedTokensToRemove,
        selectedAccessTokensToRemove,
        selectedInviteTokensToRemove,
      } = this.getProperties(
        'selectedTokensToRemove',
        'selectedAccessTokensToRemove',
        'selectedInviteTokensToRemove'
      );

      const oldSelection = tokenType === 'access' ?
        selectedAccessTokensToRemove : selectedInviteTokensToRemove;

      const removedSelection = _.difference(oldSelection, newSelection);
      const addedSelection = _.difference(newSelection, oldSelection);

      const newSelectedTokensToRemove = selectedTokensToRemove
        .filter(token => !removedSelection.includes(token))
        .concat(addedSelection);
      this.set('selectedTokensToRemove', newSelectedTokensToRemove);
    },
  },
});
