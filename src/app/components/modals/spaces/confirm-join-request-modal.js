// FIXME: jsdoc

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promise, conditional, raw } from 'ember-awesome-macros';

// FIXME: document modalOptions

export default Component.extend(I18n, {
  tagName: '',

  i18nPrefix: 'components.modals.spaces.confirmJoinRequestModal',

  i18n: service(),
  spaceManager: service(),

  closeButtonType: conditional(
    'isValid',
    raw('cancel'),
    raw('close')
  ),

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  verificationProxy: promise.object(computed(async function verificationProxy() {
    return await this.spaceManager.checkSpaceAccessRequest({
      joinRequestId: this.modalOptions.joinRequestId,
    });
  })),

  isValid: reads('verificationProxy.content.isValid'),

  isProceedButtonVisible: reads('isValid'),

  isProceedAvailable: reads('isValid'),
});
