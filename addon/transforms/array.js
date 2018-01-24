/**
 * Transforms ``Ember.Array`` (frontend) <-> JSON Array (backend).
 *
 * It adds support for using arrays as a model property type.
 *
 * @module transforms/array
 * @author Jakub Liput
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DS from 'ember-data';
import { A, isArray } from '@ember/array';

export default DS.Transform.extend({
  /**
   * @override
   */
  deserialize(serialized) {
    if (isArray(serialized)) {
      return A(serialized);
    } else {
      return A();
    }
  },

  /**
   * @override
   */
  serialize(deserialized) {
    if (isArray(deserialized)) {
      return A(deserialized);
    } else {
      return A();
    }
  },
});
