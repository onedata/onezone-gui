/**
 * @module models/shared-group
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';

export default Model.extend(GraphModelMixin, {
  name: attr('string'),
});
