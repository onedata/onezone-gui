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
   * @type {PromiseObject<Object>}
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
