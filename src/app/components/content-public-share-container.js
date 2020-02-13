/**
 * A public share container for embedded component served from Oneprovider.
 * 
 * @module components/conent-public-share-container
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { getOneproviderPath } from 'onedata-gui-common/utils/onedata-urls';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  pointerEvents: service(),

  /**
   * @virtual
   * @type {Models.Share}
   */
  share: undefined,

  /**
   * Get object simulating provider record with neccessary properties for this
   * view.
   * @type {Object}
   */
  oneprovider: computed(
    'share.{chosenProviderId,chosenProviderVersion}',
    function oneprovider() {
      const share = this.get('share');
      const entityId = get(share, 'chosenProviderId');
      return {
        entityId,
        onezoneHostedBaseUrl: getOneproviderPath(entityId),
      };
    }
  ),

  init() {
    this._super(...arguments);
    next(() => {
      safeExec(this, 'set', 'pointerEvents.pointerNoneToMainContent', true);
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    const pointerEvents = this.get('pointerEvents');
    next(() => {
      set(pointerEvents, 'pointerNoneToMainContent', false);
    });
  },
});
