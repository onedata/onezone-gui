/**
 * Confirmation of turning off space advertising in marketplace.
 * Includes submit action(standalone modal).
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.disableMarketplaceAdvertisementModal',

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

  // TODO: VFS-10252 this could be RPC in final implementation
  async disableMarketplaceAdvertisement() {
    setProperties(this.space, {
      advertisedInMarketplace: false,
    });
    try {
      await this.space.save();
    } catch (error) {
      this.space.rollbackAttributes();
      await this.space.reload();
      throw error;
    }
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
      } catch (error) {
        this.globalNotify.backendError('disablingAdvertisement', error);
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
