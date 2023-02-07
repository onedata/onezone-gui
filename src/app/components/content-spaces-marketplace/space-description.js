/**
 * Description of space for marketplace rendered from HTML to Markdown. It's collapsed
 * container has max height and can be expanded if rendered description overflows the
 * container.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import ContentOverflowDetector from 'onedata-gui-common/mixins/content-overflow-detector';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

const mixins = [
  I18n,
  ContentOverflowDetector,
];

export default Component.extend(...mixins, {
  classNames: [
    'marketplace-space-description',
  ],
  classNameBindings: ['hasOverflow:has-overflow'],

  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.spaceDescription',

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceItem}
   */
  spaceItem: undefined,

  /**
   * @override
   */
  additionalOverflowMargin: 0,

  /**
   * @override
   */
  overflowDimension: 'height',

  didInsertElement() {
    this._super(...arguments);
    this.setProperties({
      overflowElement: this.element.querySelector('.markdown-view'),
      overflowParentElement: this.element,
    });
    this.addOverflowDetectionListener();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeOverflowDetectionListener();
  },

  showDescriptionModal() {
    this.modalManager.show('spaces/description-modal', {
      spaceData: this.spaceItem,
    });
  },

  actions: {
    expand() {
      this.showDescriptionModal(true);
    },
  },
});
