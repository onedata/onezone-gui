import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import checkImg from 'onedata-gui-common/utils/check-img';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['content-clusters-onepanel-redirect'],

  globalNotify: service(),
  router: service(),

  /**
   * @virtual
   * @type {object} cluster item
   */
  cluster: undefined,

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

  redirectProxy: computed('cluster.domain', function redirectProxy() {
    return PromiseObject.create({ promise: this.redirectToOnepanel() });
  }),

  redirectToOnepanel() {
    const origin = this.get('cluster.standaloneOrigin');
    return checkImg(`${origin}/favicon.ico`)
      .then(isAvailable => {
        if (isAvailable) {
          window.location = this.get('onepanelHref');
        } else {
          const {
            router,
            cluster,
          } = this.getProperties('router', 'cluster');
          return router.transitionTo(
            'onedata.sidebar.content.aspect',
            'clusters',
            get(cluster, 'entityId'),
            'endpoint-error'
          );
        }
      });
  },
});
