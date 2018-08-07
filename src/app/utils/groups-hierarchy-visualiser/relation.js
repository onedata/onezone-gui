/**
 * Represents a relation between two groups - parent and child.
 *
 * @module utils/groups-hierarchy-visualiser/relation
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @type {Group}
   */
  parentGroup: undefined,

  /**
   * @type {Group}
   */
  childGroup: undefined,
});
