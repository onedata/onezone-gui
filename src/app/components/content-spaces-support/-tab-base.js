/**
 * Common component logic for support space modal tabs
 * 
 * @module components/content-spaces-support/-tab-base
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import generateShellCommand from 'onezone-gui/utils/generate-shell-command';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import { computed } from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';

export default Component.extend({
  /**
   * To implement in subclasses.
   * Type of command to generate
   * @virtual
   * @type {string} one of: oneprovider, onedatify
   */
  commandType: null,

  /**
   * Injected function to re-generate token (which is injected as `tokenProxy`)
   * @virtual
   * @type {function} returns Promise
   */
  getToken: notImplementedReject,

  /**
   * @virtual
   * @type {Function}
   */
  copySuccess: notImplementedThrow,

  /**
   * @virtual
   * @type {Function}
   */
  copyError: notImplementedThrow,

  /**
   * @virtual
   * @type {PromiseObject<string>}
   */
  tokenProxy: undefined,

  /**
   * @virtual
   * @type {PromiseObject<string>}
   */
  onezoneRegistrationTokenProxy: undefined,

  /**
   * Selector for input for copying to clipboard
   * @type {Ember.ComputedProperty<string>}
   */
  _clipboardTarget: computed(function () {
    return `#${this.get('elementId')} .token-input`;
  }),

  /**
   * Proxy for generated provider setup command
   * @type {Ember.ComputedProperty<PromiseObject<string>>}
   */
  commandProxy: computed(
    'commandType',
    'tokenProxy.promise',
    'onezoneRegistrationTokenProxy.promise',
    function commandProxy() {
      const tokensPromise =
        Promise.all([
          this.get('tokenProxy.promise'),
          this.get('onezoneRegistrationTokenProxy.promise'),
        ]);
      const commandType = this.get('commandType');
      if (commandType && tokensPromise) {
        return PromiseObject.create({
          promise: tokensPromise.then(([token, onezoneRegistrationToken]) =>
            generateShellCommand(commandType, { token, onezoneRegistrationToken })
          ),
        });
      }
    }),

  actions: {
    copySuccess() {
      return this.get('copySuccess')(...arguments);
    },
    copyError() {
      return this.get('copyError')(...arguments);
    },
    getToken() {
      return this.get('getToken')(...arguments)
        .catch(error => {
          console.error(
            `component:add-space-storage:-tab-base: getToken action failed: ${error && error.message || error}`
          );
        });
    },
  },
});
