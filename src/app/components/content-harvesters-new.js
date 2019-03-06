/**
 * A component that shows a form for creating a harvester.
 *
 * @module components/content-harvesters-new
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  harvesterActions: service(),
  harvesterManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersNew',

  /**
   * @type {string}
   */
  harvesterName: '',

  /**
   * @type {string}
   */
  elasticsearchEndpoint: '',

  /**
   * @type {Ember.ComputedProperty<PromiseArray<string>>}
   */
  pluginsListProxy: computed(function pluginsList() {
    return this.get('harvesterManager').getPluginsList();
  }),

  didInsertElement() {
    this._super(...arguments);
    this.$('#new-harvester-name').focus();
  },

  actions: {
    createHarvester() {
      const {
        harvesterName,
        elasticsearchEndpoint,
        harvesterActions,
      } = this.getProperties(
        'elasticsearchEndpoint',
        'harvesterName',
        'harvesterActions'
      );
      return harvesterActions.createHarvester({
        name: harvesterName,
        endpoint: elasticsearchEndpoint,
        plugin: 'elasticsearch_plugin',
        entryTypeField: 'type',
        acceptedEntryTypes: ['study', 'data_object'],
      });
    },
  },
});
