/**
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { alias } from '@ember/object/computed';

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { getOneproviderPath } from 'onedata-gui-common/utils/onedata-urls';
import { promise } from 'ember-awesome-macros';

export const entityType = 'provider';

export default Model.extend(GraphSingleModelMixin, {
  name: attr('string'),
  longitude: attr('number', { defaultValue: 0 }),
  latitude: attr('number', { defaultValue: 0 }),
  online: attr('boolean'),
  domain: attr('string'),
  cluster: belongsTo('cluster'),

  spaceList: belongsTo('space-list'),

  /**
   * Custom property similar to the `serviceType` in cluster model. Used to check whether
   * record represents Onezone or Oneprovider.
   * @type {String}
   */
  serviceType: 'oneprovider',

  onezoneHostedBaseUrl: computed('cluster.id', function onezoneHostedBaseUrl() {
    const clusterId =
      parseGri(this.belongsTo('cluster').id()).entityId;
    return getOneproviderPath(clusterId);
  }),

  /**
   * Release version of Oneprovider
   * @type {ComputedProperty<PromiseObject<String>>}
   */
  versionProxy: promise.object(computed('cluster', function versionProxy() {
    return this.get('cluster').then(cluster => get(cluster, 'workerVersion.release'));
  })),

  version: reads('versionProxy.content'),

  //#region Aliases and backward-compatibility
  host: alias('domain'),
  status: computed('online', function getStatus() {
    return this.get('online') ? 'online' : 'offline';
  }),
  //#endregion

}).reopenClass(StaticGraphModelMixin);
