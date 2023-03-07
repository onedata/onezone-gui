/**
 * Allows to select one of predefined token templates, which then can be used in
 * the token form. Each template is token-compatible object with some fields containing
 * default data.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['token-template-selector'],

  /**
   * @override
   */
  i18nPrefix: 'components.tokenTemplateSelector',

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onTemplateSelected: notImplementedIgnore,

  didInsertElement() {
    this._super(...arguments);

    this.get('element').querySelector('.one-collapsible-list-item-header').click();
  },

  actions: {
    onCustomTemplateSelected() {
      this.get('onTemplateSelected')('custom', {});
    },
  },
});
