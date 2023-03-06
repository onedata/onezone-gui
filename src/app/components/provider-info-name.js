/**
 * Provider name, icon and popup with more details
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
export default Component.extend(I18n, {
  tagName: 'span',
  classNames: ['provider-info-name'],

  /**
   * @virtual
   * @type {Models.Provider}
   */
  provider: undefined,

  /**
   * @vitual optional
   * @type {string}
   */
  iconColor: undefined,

  /**
   * If true, block icon is hovered
   * @type {boolean}
   */
  isIconHovered: false,

  /**
   * @type {boolean}
   */
  providerInfoOpened: false,

  actions: {
    changeIconHover(isIconHovered) {
      this.set('isIconHovered', isIconHovered);
    },
  },
});
