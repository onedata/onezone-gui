/**
 * Implements `user-account-button` for Onedata Websocket backend based GUIs
 * - sets `username` from User record from Onedata Websocket
 *
 * NOTE: requires onedata websocket managed session
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  currentUser: service(),

  /**
   * @virtual
   * @type {boolean}
   */
  isActive: undefined,

  /**
   * @virtual optional
   * @type {(targetResourceType: string) => void}
   */
  onItemClick: undefined,

  /**
   * @virtual
   * @type {(opened: boolean) => void}
   */
  onMenuOpened: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  mobileMode: undefined,

  /**
   * @type {Models.User}
   */
  user: undefined,

  username: reads('user.name'),

  init() {
    this._super(...arguments);
    this.currentUser.getCurrentUserRecord().then(user =>
      this.set('user', user)
    );
  },
});
