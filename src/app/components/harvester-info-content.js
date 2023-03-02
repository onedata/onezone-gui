/**
 * Content of popup with information about harvester
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import HarvesterInfoContent from 'onedata-gui-common/components/harvester-info-content';

export default HarvesterInfoContent.extend({
  router: service(),
  guiUtils: service(),

  /**
   * @type {Location}
   */
  _location: location,

  /**
   * @override
   */
  publicUrl: computed('record.entityId', function publicUrl() {
    if (this.record.entityId && this.record.public) {
      return this._location.origin + this._location.pathname +
        this.router.urlFor('public.harvesters', this.record.entityId);
    } else {
      return null;
    }
  }),

  /**
   * @override
   */
  linkToHarvester: computed('record', function linkToHarvester() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'harvesters',
      this.guiUtils.getRoutableIdFor(this.record),
      'plugin'
    );
  }),
});
