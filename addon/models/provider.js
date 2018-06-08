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
import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';

export const providerStatusList = ['online', 'offline'];

export default Model.extend(GraphModelMixin, {
  name: attr('string'),
  // TODO: add array transform
  // urls: attr('array'),
  // clientName: attr('string'),
  redirectionPoint: attr('string'),
  longitude: attr('number', { defaultValue: 0 }),
  latitude: attr('number', { defaultValue: 0 }),
  online: attr('boolean'),
  domain: attr('string'),

  spaceList: belongsTo('space-list'),

  isStatusValid: computed('status', function () {
    return providerStatusList.indexOf(this.get('status')) !== -1;
  }),

  //#region Aliases and backward-compatibility
  host: alias('domain'),
  status: computed('online', function getStatus() {
    return this.get('online') ? 'online' : 'offline';
  }),
  //#endregion

});
