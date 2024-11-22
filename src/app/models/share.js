/**
 * @author Jakub Liput
 * @copyright (C) 2019-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export const entityType = 'share';

export default Model.extend(GraphSingleModelMixin, {
  spaceManager: service(),

  name: attr('string'),
  hasHandle: attr('boolean'),
  chosenProviderId: attr('string'),
  chosenProviderVersion: attr('string'),
  fileType: attr('string'),
  // space: belongsTo('space'),
  // FIXME: hack
  space: computed(function () {
    const spaceManager = this.spaceManager;
    const promise = (async () => {
      return spaceManager.getRecordById('01789649985817106dc6fe928dff2bfechb70b');
    })();
    return promiseObject(promise);
  }),
}).reopenClass(StaticGraphModelMixin);
