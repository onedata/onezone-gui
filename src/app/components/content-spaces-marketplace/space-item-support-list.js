/**
 * Displays single-line space support information (size and supporters)
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import ContentOverflowDetector from 'onedata-gui-common/mixins/content-overflow-detector';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const mixins = [
  I18n,
  ContentOverflowDetector,
];

export default Component.extend(...mixins, {
  classNames: ['space-item-support-list'],
  classNameBindings: ['hasOverflow:has-overflow'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.spaceItemSupportList',

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
  overflowDimension: 'width',

  /**
   * Total size of support in bytes.
   * @type {ComputedProperty<number>}
   */
  supportSize: reads('spaceItem.totalSupportSize'),

  /**
   * Supporting providers names.
   * @type {ComputedProperty<Array<string>>}
   */
  providerNames: reads('spaceItem.providerNames'),

  didInsertElement() {
    this._super(...arguments);
    this.setProperties({
      overflowElement: this.element.querySelector('.list-container'),
      overflowParentElement: this.element,
    });
    this.addOverflowDetectionListener();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeOverflowDetectionListener();
  },
});
