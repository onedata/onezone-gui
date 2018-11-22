import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  onedataConnection: service(),

  /**
   * @virtual
   * @type {models/Cluster}
   */
  cluster: undefined,

  onepanelRedirectPath: reads('onedataConnection.onepanelRedirectPath'),

  onepanelHref: computed('cluster.domain', 'onepanelRedirectPath', function onepanelHref() {
    return `https://${this.get('cluster.domain')}:9443${this.get('onepanelRedirectPath')}`;
  }),
});
