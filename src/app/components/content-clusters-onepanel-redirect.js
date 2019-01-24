import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['content-clusters-onepanel-redirect'],

  cluster: undefined,

  aspect: undefined,

  clusterId: reads('cluster.entityId'),

  clusterType: reads('cluster.type'),

  onepanelPathAbbrev: computed('clusterType', function onepanelPathAbbrev() {
    return this.get('clusterType') === 'oneprovider' ? 'opp' : 'ozp';
  }),

  onepanelHref: computed(
    'onepanelPathAbbrev',
    'clusterId',
    function onepanelHref() {
      const clusterId = this.get('clusterId');
      return `${location.origin}/${this.get('onepanelPathAbbrev')}/${clusterId}/i#/clusters/${clusterId}`;
    }),

  init() {
    this._super(...arguments);
    this.redirectToOnepanel(this.get('aspect'));
  },

  redirectToOnepanel() {
    window.location = this.get('onepanelHref');
  },
});
