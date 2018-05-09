/**
 * A single group representation.
 * This can be any group that exists in Onedata no matter it is accessible by
 * current user. See also models/group
 *
 * @module models/system-group
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  name: attr('string'),
});
