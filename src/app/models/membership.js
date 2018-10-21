/**
 * Membership information
 * 
 * @module models/membership
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * Array of direct members gri (of record related to entityId), which are
   * elements of membership paths. 
   * @type {Array<string>}
   */
  intermediaries: attr('array'),

  /**
   * True if two membership related records are related via direct membership
   * @type {boolean}
   */
  directMembership: attr('boolean'),
});
