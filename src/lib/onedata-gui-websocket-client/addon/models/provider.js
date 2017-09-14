/**
 * @module models/provider
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';

export default Model.extend({
  name: attr('string'),
  // TODO: add array transform
  // urls: attr('array'),
  clientName: attr('string'),
  redirectionPoint: attr('string'),
  longitude: attr('number'),
  latitude: attr('number'),

  spaceList: belongsTo('space-list'),
});
