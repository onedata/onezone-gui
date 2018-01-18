/**
 * A dropdown component which presents authorizers.
 *
 * @module components/authorizers-dropdown
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  classNames: ['authorizers-dropdown'],

  /**
   * @type {Array<AuthorizerInfo>}
   */
  authorizers: Object.freeze([]),

  /**
   * Authorizer selected in powerselect
   * @type {undefined|AuthorizerInfo}
   */
  selectedAuthorizer: undefined,

  /**
   * Authorizer, which is being used by some operation at the moment
   * @type {undefined|AuthorizerInfo}
   */
  activeAuthorizer: undefined,

  /**
   * Placeholder for not selected powerselect.
   * @type {string}
   */
  placeholder: '',

  /**
   * @type {boolean}
   */
  disabled: false,

  /**
   * Action called on authorizer select.
   * @type {function}
   * @param {AuthorizerInfo} authorizer selected authorizer
   * @returns {undefined}
   */
  onSelect: () => {},

  /**
   * Powerselect item matcher used by its search engine.
   * @param {AuthorizerInfo} authorizer 
   * @param {string} term Query string.
   * @returns {boolean} True, if authorizer matches given term.
   */
  _authorizersSelectMatcher(authorizer, term) {
    return authorizer.name.toLowerCase().indexOf(term.toLowerCase());
  },

  actions: {
    authorizerSelected(authorizer) {
      this.get('onSelect')(authorizer);
    },
  },
});
