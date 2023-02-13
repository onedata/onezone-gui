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

export default Component.extend(ContentOverflowDetector, {
  classNames: ['space-item-support-list'],
  classNameBindings: ['hasOverflow:has-overflow'],

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
});
