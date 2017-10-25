/**
 * Base serializer for `adapter:onedata-websocket`
 *
 * @module serializers/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import JSONSerializer from 'ember-data/serializers/json';

export default JSONSerializer.extend({
  primaryKey: 'gri',
});
