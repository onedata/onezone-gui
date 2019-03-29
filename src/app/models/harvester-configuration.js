/**
 * Harvester configuration
 * 
 * @module models/harvester-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { computed } from '@ember/object';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * Contains configuration of the related harvester
   * @type {Object}
   */
  config: attr('object'),

  /**
   * Stringified, human-readable representation of config
   * @type {Ember.ComputedProperty<string>}
   */
  stringifiedConfig: computed('config', function stringifiedConfig() {
    const config = this.get('config');
    return JSON.stringify(config, null, 2);
  }),
});
