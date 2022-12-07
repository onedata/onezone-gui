// FIXME: jsdoc

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, not, promise, conditional, raw, isEmpty, array, and, notEmpty } from 'ember-awesome-macros';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { emailRegex } from 'onedata-gui-common/utils/validators/email';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  spaceManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.chooseSpaceToAdvertiseModal',

  // FIXME: maybe not needed
  /**
   * @virtual
   * @type {Object}
   */
  modalOptions: undefined,

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

  // spacesToAdvertiseOptions: computed(
  //   'nonAdvertisedSpaces',
  //   function spacesToAdvertiseOptions() {

  //   }
  // ),

  noSpaces: isEmpty('allSpaces'),

  areAllSpacesAdvertised: and(not('noSpaces'), isEmpty('nonAdvertisedSpaces')),

  // FIXME: remove if not used, only if space is selected
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
    } catch {
      // FIXME: implement (cannot open space configuration)
    } finally {
      safeExec(this, () => this.set('isSubmitting', false));
    }
  },

  actions: {
    // async submit(submitCallback) {
    //   if (!this.isProceedAvailable) {
    //     return;
    //   }
    //   this.set('isSubmitting', true);
    //   try {
    //     await submitCallback(this.selectedSpace);
    //   } catch {
    //     // FIXME: implement
    //   } finally {
    //     safeExec(this, () => this.set('isSubmitting', false));
    //   }
    // },
    spaceChanged(space) {
      this.set('selectedSpace', space);
    },
  },
});
