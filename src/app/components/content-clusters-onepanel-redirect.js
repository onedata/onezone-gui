import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import checkImg from 'onedata-gui-common/utils/check-img';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['content-clusters-onepanel-redirect'],

  globalNotify: service(),
  i18n: service(),
  alert: service(),

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
          const i18n = this.get('i18n');
          this.get('alert').error(null, {
            componentName: 'alerts/endpoint-error',
            header: i18n.t('components.alerts.endpointError.headerPrefix') +
              ' ' +
              i18n.t('components.alerts.endpointError.onepanel'),
            url: origin,
            serverType: 'onepanel',
          });
          throw {
            isOnedataCustomError: true,
            type: 'endpoint-error',
            cluster: this.get('cluster'),
          };
        }
      });
  },
});
