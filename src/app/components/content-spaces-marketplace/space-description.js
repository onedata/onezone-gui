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
// FIXME: remove jquery after merginig jquery remove to develop
import $ from 'jquery';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

const mixins = [
  I18n,
  ContentOverflowDetector,
];

export default Component.extend(...mixins, {
  classNames: [
    'marketplace-space-description',
    'space-description-markdown-container',
  ],
  classNameBindings: ['hasOverflow:has-overflow', 'isExpanded:is-expanded'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.spaceDescription',

  //#region state

  isExpanded: false,

  //#endregion

  /**
   * @virtual
   * @type {SpaceMarketplaceData}
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
      overflowElement: $(this.element.querySelector('.markdown-view')),
      overflowParentElement: $(this.element),
    });
    this.addOverflowDetectionListener();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeOverflowDetectionListener();
  },

  toggleExpand(shouldBeExpanded) {
    this.set('isExpanded', shouldBeExpanded);
    (async () => {
      await waitForRender();
      this.detectOverflow();
    })();
  },

  actions: {
    expand() {
      this.toggleExpand(true);
    },
    collapse() {
      this.toggleExpand(false);
    },
  },
});
