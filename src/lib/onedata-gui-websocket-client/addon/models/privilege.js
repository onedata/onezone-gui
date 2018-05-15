/**
 * A set of privileges
 * 
 * @module models/privilege
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  /**
   * It is an array of privileges (as strings).
   * WARNING: It is intended to be an immutable data structure! To persist 
   * modifications it must be replaced by a new array.
   */
  privileges: attr('array'),
});

