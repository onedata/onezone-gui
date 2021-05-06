/**
 * Container for remote file browser of single space with Oneprovider selector
 * 
 * @module components/content-spaces-data
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'content-spaces-datasets',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesDatasets',

  navigationState: service(),

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  /**
   * One of: attached, detached.
   * @type {String}
   */
  attachmentState: reads('navigationState.aspectOptions.attachmentState'),

  effAttachmentState: computed('attachmentState', function effAttachmentState() {
    const attachmentState = this.get('attachmentState');
    return this.isValidAttachmentState(attachmentState) ? attachmentState : 'attached';
  }),

  isValidAttachmentState(state) {
    return ['attached', 'detached'].includes(state);
  },

  attachmentStateChanged(attachmentState) {
    this.get('navigationState').setAspectOptions({
      attachmentState,
      dataset: null,
    });
  },

  actions: {
    oneproviderIdChanged(oneproviderId) {
      this.get('navigationState').setAspectOptions({
        oneproviderId,
      });
    },
    attachmentStateChanged(attachmentState) {
      this.attachmentStateChanged(attachmentState);
    },
  },
});
