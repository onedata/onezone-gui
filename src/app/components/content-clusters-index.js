import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-clusters-index'],

  i18nPrefix: 'components.contentClustersIndex',

  onedataConnection: service(),

  /**
   * @virtual
   * @type {models/Cluster}
   */
  cluster: undefined,

  clusterId: reads('cluster.entityId'),

  onepanelPathAbbrev: computed('cluster.type', function onepanelPathAbbrev() {
    return this.get('cluster.type') === 'oneprovider' ? 'opp' : 'ozp';
  }),

  onepanelHref: computed('onepanelPathAbbrev', 'clusterId',
    function onepanelHref() {
      return `${location.origin}/${this.get('onepanelPathAbbrev')}/${this.get('clusterId')}/i`;
    }),
});
