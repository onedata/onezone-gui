/**
 * Content of popup with information about space
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import SpaceInfoContent from 'onedata-gui-common/components/space-info-content';

export default SpaceInfoContent.extend({
  router: service(),
  guiUtils: service(),
  modalManager: service(),

  /**
   * @override
   */
  showLinkToRestApiModal: true,

  /**
   * @override
   */
  showLinkToFileBrowser: true,

  async onOpenRestApiModal() {
    return await this.modalManager.show('api-samples-modal', {
      record: this.record,
      apiSubject: 'space',
    }).hiddenPromise;
  },

  /**
   * @override
   */
  linkToFileBrowser: computed('record', function linkToFileBrowser() {
    if (this.showDetails) {
      return this.router.urlFor(
        'onedata.sidebar.content.aspect',
        'spaces',
        this.guiUtils.getRoutableIdFor(this.record),
        'data'
      );
    }
  }),
});
