/**
 * Renders buttons for supported login providers. A container for social-boxes.
 * @module components/login-box/social-box-list
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2016-2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  /**
   * If true, component is waiting for auth providers data loading.
   * @virtual
   * @type {boolean}
   */
  isLoading: false,

  /**
   * If true, 'three dots' button for showing all auth providers will be visible
   * @virtual
   * @type {boolean}
   */
  showMoreButton: false,

  /**
   * List of authorizers
   * @virtual
   * @type {Array<AuthorizerInfo>}
   */
  supportedAuthorizers: null,

  /**
   * Action invoked on 'show more' button click.
   * @virtual
   * @type {function}
   * @returns {undefined}
   */
  showMoreClick: () => {},

  /**
   * Action invoked on 'login using username' button click.
   * @virtual
   * @type {function}
   * @returns {undefined}
   */
  usernameLoginClick: () => {},

  actions: {
    authenticate(socialBox) {
      socialBox.set('active', true);
      this.get('authenticate')(socialBox.get('type')).finally(() => {
        socialBox.set('active', false);
      });
    },
    usernameBoxClick() {
      this.get('usernameLoginClick')();
    },
    showMoreClick() {
      this.get('showMoreClick')();
    },
  },
});
