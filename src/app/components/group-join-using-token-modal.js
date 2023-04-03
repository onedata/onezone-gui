/**
 * Shows modal asking for invitation token, that will be used to join a group.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import $ from 'jquery';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.groupJoinUsingTokenModal',

  /**
   * If true, modal is opened
   * @type {boolean}
   * @virtual
   */
  opened: false,

  /**
   * If true, modal cannot be closed and proceed button has active spinner
   * @type {boolean}
   * @virtual
   */
  processing: false,

  /**
   * Action called to close modal
   * @type {function}
   * @virtual
   * @returns {*}
   */
  close: notImplementedThrow,

  /**
   * Action called to proceed
   * @type {function}
   * @virtual
   * @returns {*}
   */
  proceed: notImplementedThrow,

  /**
   * Group for which new group will be created
   * @type {Group}
   * @virtual
   */
  relatedGroup: undefined,

  /**
   * New group name.
   * @type {string}
   */
  token: '',

  /**
   * If true, proceed button is disabled
   * @type {Ember.ComputedProperty<boolean>}
   */
  proceedDisabled: computed('processing', 'token', function proceedDisabled() {
    const {
      processing,
      token,
    } = this.getProperties('processing', 'token');
    return processing || !token;
  }),

  openedObserver: observer('opened', function openedObserver() {
    this.set('token', '');
  }),

  actions: {
    onShown() {
      $('.join-group-invitation-token').focus();
    },
    join() {
      return this.get('proceed')(this.get('token'));
    },
    redirectToSubmit() {
      $('.group-join-using-token-modal .proceed').click();
    },
  },
});
