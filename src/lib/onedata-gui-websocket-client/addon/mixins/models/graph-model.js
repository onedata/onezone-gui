/**
 * Adds convenience computed properties for desctructuring Graph Resource Identifier
 * from ID of models
 *
 * @module mixins/models/graph-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { oneWay, readOnly } from '@ember/object/computed';

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

export default Mixin.create({
  gri: oneWay('id'),

  parsedGri: computed('gri', function getParsedGri() {
    let gri = this.get('gri');
    if (gri) {
      return parseGri(gri);
    }
  }),

  entityType: readOnly('parsedGri.entityType'),
  entityId: readOnly('parsedGri.entityId'),
  aspect: readOnly('parsedGri.aspect'),
  scope: readOnly('parsedGri.scope'),
});
