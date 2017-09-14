/**
 * @module models/user
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';

export default Model.extend({
  isCollection: true,

  name: attr('string'),

  spaceList: belongsTo('spaceList'),
  groupList: belongsTo('groupList'),
  providerList: belongsTo('providerList'),
});