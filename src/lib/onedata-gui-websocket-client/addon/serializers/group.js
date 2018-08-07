/**
 * Specialized serializer for group model. Sets default values for attributes,
 * that are optional in requests. It is needed, because after reload, if some 
 * attributes disappear from the payload, their values are not resetted.
 *
 * @module serializers/group
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Serializer from 'onedata-gui-websocket-client/serializers/application';
import { get, set } from '@ember/object';

export default Serializer.extend({
  extractAttributes(modelClass, resourceHash) {
    const attributes = this._super(modelClass, resourceHash);

    // Set default value for directMembership
    if (get(attributes, 'directMembership') === undefined) {
      set(attributes, 'directMembership', false);
    }
    // Set default value for canViewPrivileges
    if (get(attributes, 'canViewPrivileges') === undefined) {
      set(attributes, 'canViewPrivileges', false);
    }

    return attributes;
  },
});
