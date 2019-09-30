/**
 * TODO: Prototype of go to first online Onprovider that supports this space
 * Need to implement:
 * - disable/show error sign when no Oneprovider is online
 * 
 * @module components/content-spaces-data
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  classNames: [
    'content-spaces-data',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  /**
   * Space selected in sidebar to show its embedded content using one
   * of available Oneproviders.
   * @virtual
   * @type {models.Space}
   */
  space: undefined,

  /**
   * One of the Oneproviders that support `space` which will be used
   * to render embedded component
   * @virtual
   * @type {models.Provider}
   */
  selectedProvider: undefined,
});
