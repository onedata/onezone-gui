/**
 * @module models/provider
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { alias } from '@ember/object/computed';

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { computed } from '@ember/object';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

export const providerStatusList = ['online', 'offline'];

export default Model.extend(GraphSingleModelMixin, {
  name: attr('string'),
  // TODO: add array transform
  // urls: attr('array'),
  // clientName: attr('string'),
  longitude: attr('number', { defaultValue: 0 }),
  latitude: attr('number', { defaultValue: 0 }),
  online: attr('boolean'),
  domain: attr('string'),
  cluster: belongsTo('cluster'),

  spaceList: belongsTo('space-list'),

  isStatusValid: computed('status', function () {
    return providerStatusList.includes(this.get('status'));
  }),

  onezoneHostedBaseUrl: computed('cluster.id', function onezoneHostedBaseUrl() {
    const clusterId =
      parseGri(this.belongsTo('cluster').id()).entityId;
    return `/opw/${clusterId}/i`;
  }),

  //#region Aliases and backward-compatibility
  host: alias('domain'),
  status: computed('online', function getStatus() {
    return this.get('online') ? 'online' : 'offline';
  }),
  //#endregion

});
