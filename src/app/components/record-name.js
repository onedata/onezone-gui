/**
 * Shows record name (for any model) and username (only users)
 *
 * @module components/record-name
 * @author Agnieszka Warchoł
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  tagName: 'span',
  classNames: ['record-name', 'one-label'],

  /**
   * @virtual
   * @type { { name: String, [username]: String } }
   */
  record: undefined,
});
