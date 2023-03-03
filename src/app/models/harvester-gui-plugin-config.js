/**
 * Harvester configuration
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { computed } from '@ember/object';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * Contains configuration of the related harvester gui plugin
   * @type {Object}
   */
  guiPluginConfig: attr('object'),

  /**
   * Stringified, human-readable representation of config
   * @type {Ember.ComputedProperty<string>}
   */
  guiPluginConfigStringified: computed(
    'guiPluginConfig',
    function guiPluginConfigStringified() {
      const guiPluginConfig = this.get('guiPluginConfig');
      return JSON.stringify(guiPluginConfig, null, 2);
    }
  ),
}).reopenClass(StaticGraphModelMixin);
