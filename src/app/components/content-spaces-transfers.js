/**
 * Main container for space transfers view
 * 
 * @module components/content-spaces-transfers
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  classNames: [
    'oneprovider-view-container',
    'content-spaces-transfers',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  /**
   * @virtual
   * @type {string}
   */
  fileId: undefined,
});
