/**
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Model.extend(GraphSingleModelMixin, {
  onedataConnection: service(),

  type: attr('string'),
  provider: belongsTo('provider'),
  onepanelProxy: attr('boolean'),

  name: computed('type', 'provider.content.name', function name() {
    if (this.get('type') === 'oneprovider') {
      return this.get('provider.content.name');
    } else {
      return this.get('onedataConnection.zoneName');
    }
  }),

  domain: computed('type', 'provider.content.domain', function domain() {
    if (this.get('type') === 'oneprovider') {
      return this.get('provider.content.domain');
    } else {
      return location.hostname;
    }
  }),

  init() {
    this._super(...arguments);
    // force get provider to have fields like name and domain
    this.get('provider');
  },
});
