/**
 * Content of popup with information about space
 * 
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import spaceInfoContent from '../../lib/onedata-gui-common/addon/components/space-info-content';

export default spaceInfoContent.extend({
  router: service(),
  guiUtils: service(),

  showRestApiModalLink: true,

  link: computed('space', function link() {
    const {
      router,
      space,
      guiUtils,
    } = this.getProperties('router', 'space', 'guiUtils');
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      guiUtils.getRoutableIdFor(space),
      'data'
    );
  }),

  async onExecute() {
    return await this.modalManager.show('api-samples-modal', {
      record: this.space,
      apiSubject: 'space',
    }).hiddenPromise;
  },

  actions: {
    openRestApiModal() {
      this.onExecute();
    },
  },
});
