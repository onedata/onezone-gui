// FIXME: jsdoc
// FIXME: refactor to be in modals/spaces/

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaceConfiguration.disableMarketplaceAdvertisementModal',

  /**
   * @virtual
   * @type {{ space: Models.Space }}
   */
  modalOptions: undefined,

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  //#region state

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  //#endregion

  space: reads('modalOptions.space'),

  areButtonsDisabled: reads('isSubmitting'),

  async disableMarketplaceAdvertisement() {
    this.space.setProperties({
      advertisedInMarketplace: false,
    });
    await this.space.save();
  },

  actions: {
    async submit(submitCallback, result) {
      if (this.areButtonsDisabled) {
        return;
      }
      this.set('isSubmitting', true);
      try {
        await this.disableMarketplaceAdvertisement();
        await submitCallback(result);
      } catch {
        // FIXME: implement
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
