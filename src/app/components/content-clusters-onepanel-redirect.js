import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import checkImg from 'onedata-gui-common/utils/check-img';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['content-clusters-onepanel-redirect'],

  globalNotify: service(),

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

  redirectProxy: computed(function redirectProxy() {
    return PromiseObject.create({ promise: this.redirectToOnepanel() });
  }),

  redirectToOnepanel() {
    return checkImg(`https://${this.get('cluster.domain')}:9443/favicon.ico`)
      .then(isAvailable => {
        if (isAvailable) {
          window.location = this.get('onepanelHref');
        } else {
          // FIXME: design of not available domain and text
          this.get('globalNotify').backendError('reading cluster endpoint');
          throw new Error(
            'Selected cluster domain is not available for your web browser.'
          );
        }
      });
  },
});
