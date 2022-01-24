/**
 * Information about provider
 * 
 * @module components/provider-info
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
export default Component.extend(I18n, {
  tagName: 'span',

  /**
   * If true, block icon is hovered
   * @type {boolean}
   */
  isIconHovered: false,

  /**
   * @type {boolean}
   */
  providerInfoOpened: false,

  /**
   * @type {ComputedProperty<string>}
   */
  icon: computed('isIconHovered', 'providerInfoOpened', function icon() {
    if (this.get('isIconHovered') || this.get('providerInfoOpened')) {
      return 'browser-info';
    }
    return 'provider';
  }),

  actions: {
    changeIconHover(isIconHovered) {
      this.set('isIconHovered', isIconHovered);
    },
  },
});
