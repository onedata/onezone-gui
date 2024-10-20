/**
 * A modal that is a confirmation of removing obsolete tokens. Allows to select
 * which obsolete tokens should be removed. Data needed from modalOptions:
 * * tokensToRemove - list with all tokens possible to remove
 * * selectedTokensToRemove - [optional] a list of preselected tokens (must be a
 *   subset of tokensToRemove). If not provided, then all tokens will be preselected.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { notEmpty, or } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.cleanObsoleteTokensModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

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
  selectedAccessTokensToRemove: undefined,

  /**
   * @type {Array<Models.Token>}
   */
  selectedIdentityTokensToRemove: undefined,

  /**
   * @type {Array<Models.Token>}
   */
  selectedInviteTokensToRemove: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  tokensToRemove: reads('modalOptions.tokensToRemove'),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  accessTokensToRemove: computed(
    'tokensToRemove.@each.typeName',
    function accessTokensToRemove() {
      return this.tokensToRemove
        ?.filter((token) => get(token, 'typeName') === 'access') ?? [];
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  identityTokensToRemove: computed(
    'tokensToRemove.@each.typeName',
    function identityTokensToRemove() {
      return this.tokensToRemove
        ?.filter((token) => get(token, 'typeName') === 'identity') ?? [];
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Models.Token>>}
   */
  inviteTokensToRemove: computed(
    'tokensToRemove.@each.typeName',
    function inviteTokensToRemove() {
      return this.tokensToRemove
        ?.filter((token) => get(token, 'typeName') === 'invite') ?? [];
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasSelectedTokensToRemove: or(
    notEmpty('selectedAccessTokensToRemove'),
    notEmpty('selectedIdentityTokensToRemove'),
    notEmpty('selectedInviteTokensToRemove')
  ),

  init() {
    this._super(...arguments);

    this.initializeSelectedTokensArrays();
  },

  initializeSelectedTokensArrays() {
    const selectedTokensToRemove = this.get('modalOptions.selectedTokensToRemove') ||
      this.get('tokensToRemove');

    this.setProperties({
      selectedAccessTokensToRemove: selectedTokensToRemove.filterBy('typeName', 'access'),
      selectedIdentityTokensToRemove: selectedTokensToRemove.filterBy('typeName', 'identity'),
      selectedInviteTokensToRemove: selectedTokensToRemove.filterBy('typeName', 'invite'),
    });
  },

  actions: {
    selectionChange(tokenType, newSelection) {
      const selectedTokensFieldName = `selected${_.upperFirst(tokenType)}TokensToRemove`;
      this.set(selectedTokensFieldName, newSelection);
    },
    submit(submitCallback) {
      const {
        selectedAccessTokensToRemove,
        selectedIdentityTokensToRemove,
        selectedInviteTokensToRemove,
      } = this.getProperties(
        'selectedAccessTokensToRemove',
        'selectedIdentityTokensToRemove',
        'selectedInviteTokensToRemove',
      );

      this.set('isSubmitting', true);
      return resolve(submitCallback([
        ...selectedAccessTokensToRemove,
        ...selectedIdentityTokensToRemove,
        ...selectedInviteTokensToRemove,
      ])).finally(() => safeExec(this, () => this.set('isSubmitting', false)));
    },
  },
});
