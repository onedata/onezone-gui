/**
 * @module models/client-token
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Model.extend(GraphSingleModelMixin, {
  token: attr('string'),
  name: computed('token', function () {
    const token = this.get('token');
    return token &&
      token.slice(0, 3) + '...' + token.slice(token.length - 12, token.length);
  }),
});
