/**
 * @module models/provider
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { computed } from '@ember/object';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';

export const providerStatusList = ['online', 'offline', 'pending'];

export default Model.extend({
  name: attr('string'),
  // TODO: add array transform
  // urls: attr('array'),
  // clientName: attr('string'),
  redirectionPoint: attr('string'),
  longitude: attr('number'),
  latitude: attr('number'),
  status: attr('string', { defaultValue: 'pending' }),
  host: attr('string'),

  spaceList: belongsTo('space-list'),

  isStatusValid: computed('status', function () {
    return providerStatusList.indexOf(this.get('status')) !== -1;
  }),
});
