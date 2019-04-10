/**
 * A set of privileges
 * 
 * @module models/index
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import gri from 'onedata-gui-websocket-client/utils/gri';
import _ from 'lodash';
import { computed } from '@ember/object';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {string}
   */
  name: attr('string'),

  /**
   * @type {Object}
   */
  schema: attr('string'),

  /**
   * @type {string}
   */
  guiPluginName: attr('string'),

  /**
   * @type {Ember.ComputedProperty<models.IndexProgress>}
   */
  progress: computed(
    'entityType',
    'entityId',
    'aspectId',
    function indexProgress() {
      const progressGri = gri(_.assign(
        { aspect: 'index_progress', scope: 'private' },
        this.getProperties('entityType', 'entityId', 'aspectId'))
      );
      return this.get('store').findRecord('index-progress', progressGri);
    }
  ),
});
