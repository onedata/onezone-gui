/**
 * Adds convenience computed properties for desctructuring Graph Resource Identifier
 * from ID of models
 *
 * @module mixins/models/graph-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

export default Mixin.create({
  gri: computed.oneWay('id'),

  parsedGri: computed('gri', function getParsedGri() {
    let gri = this.get('gri');
    if (gri) {
      return parseGri(gri);
    }
  }),

  entityType: computed.readOnly('parsedGri.entityType'),
  entityId: computed.readOnly('parsedGri.entityId'),
  aspect: computed.readOnly('parsedGri.aspect'),
  scope: computed.readOnly('parsedGri.scope'),
});
