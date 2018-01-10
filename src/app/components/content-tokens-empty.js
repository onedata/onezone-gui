/**
 * An component with infrmation about no available token.
 *
 * @module components/content-tokens-empty
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['content-tokens'],

  globalNotify: inject(),
  clientTokenManager: inject(),

  actions: {
    createToken() {
      return this.get('clientTokenManager').createRecord();
    },
  },
});
