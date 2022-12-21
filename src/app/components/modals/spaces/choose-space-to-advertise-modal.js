/**
 * Modal with information about advertising own space and go-to-configuration action.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, not, promise, conditional, raw, isEmpty, array, and, notEmpty } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  spaceManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.chooseSpaceToAdvertiseModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  //#region state

  isSubmitting: false,

  /**
   * @type {Models.Space}
   */
  selectedSpace: null,

  //#endregion

  allSpacesProxy: promise.object(computed(async function allSpacesProxy() {
    const spaceList = await this.spaceManager.getSpaces();
    return (await get(spaceList, 'list')).toArray();
  })),

  allSpaces: reads('allSpacesProxy.content'),

  nonAdvertisedSpaces: array.filterBy(
    'allSpaces',
    raw('advertisedInMarketplace'),
    raw(false)
  ),

  noSpaces: isEmpty('allSpaces'),

  areAllSpacesAdvertised: and(not('noSpaces'), isEmpty('nonAdvertisedSpaces')),

  isProceedAvailable: and('isProceedButtonVisible', notEmpty('selectedSpace')),

  isProceedButtonVisible: not(or('noSpaces', 'areAllSpacesAdvertised')),

  closeButtonType: conditional(
    'isProceedButtonVisible',
    raw('cancel'),
    raw('close')
  ),

  async proceed(submitCallback, result) {
    if (!this.isProceedAvailable) {
      throw new Error('proceeding to space configuration is not available');
    }
    this.set('isSubmitting', true);
    try {
      await submitCallback(result);
    } finally {
      safeExec(this, () => this.set('isSubmitting', false));
    }
  },

  actions: {
    spaceChanged(space) {
      this.set('selectedSpace', space);
    },
  },
});
