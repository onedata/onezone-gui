/**
 * A conent page with list of all uploads
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  classNames: ['content-uploads'],

  /**
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,
});
