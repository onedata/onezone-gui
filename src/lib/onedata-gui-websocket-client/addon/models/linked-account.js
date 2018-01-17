/**
 * @module models/linked-account
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';

export default Model.extend(GraphModelMixin, {
  type: attr('string'),
  emails: attr('array'),
});
