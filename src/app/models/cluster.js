/**
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Model.extend(GraphSingleModelMixin, {
  type: attr('string'),
  serviceId: attr('string'),
  name: attr('string'),
  domain: attr('string'),
  onepanelProxy: attr('boolean'),
});
