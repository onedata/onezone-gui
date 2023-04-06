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
import { observer } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

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

  /**
   * @type {ResizeObserver}
   */
  resizeObserver: null,

  initResizeObserver() {
    const element = this.element;
    if (!this.element || this.resizeObserver) {
      return;
    }
    /** @type {ResizeObserver} */
    const resizeObserver = new ResizeObserver((entries) => {
      /** @type {ResizeObserverEntry} */
      const entry = entries.find(entry => entry.target === element);
      if (entry) {
        this.detectOverflow();
      }
    });
    resizeObserver.observe(element);
    this.set('resizeObserver', resizeObserver);
  },

  destroyResizeObserver() {
    this.resizeObserver?.disconnect();
    this.set('resizeObserver', null);
  },

  didInsertElement() {
    this._super(...arguments);
    this.setProperties({
      overflowElement: this.element.querySelector('.markdown-view'),
      overflowParentElement: this.element,
    });
    this.addOverflowDetectionListener();
    this.detectOverflow();
    this.initResizeObserver();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeOverflowDetectionListener();
    this.destroyResizeObserver();
  },

  showDescriptionModal() {
    this.modalManager.show('spaces/description-modal', {
      spaceData: this.spaceItem,
    });
  },

  actions: {
    expand() {
      this.showDescriptionModal();
    },
  },
});
