/**
 * Token template base component. Allows to construct templates, which do not require any
 * additional adjustments.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: tag `components.tokenTemplateSelector.templates.${'templateName'}`,

  /**
   * @virtual
   * @type {String}
   */
  templateName: undefined,

  /**
   * @virtual
   * @type {String}
   */
  imagePath: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onSelected: notImplementedIgnore,

  /**
   * @virtual
   * @returns {Object}
   */
  generateTemplate() {
    return {};
  },

  tokenTemplateInfoTriggerId: computed(
    'templateName',
    function tokenTemplateInfoTriggerId() {
      return `token-template-info-${this.templateName}`;
    }
  ),

  isLink1Present: computed(
    function isLink1Present() {
      return typeof this.t('link1') === 'object';
    }
  ),

  isLink2Present: computed(
    function isLink1Present() {
      return typeof this.t('link2') === 'object';
    }
  ),

  tooltipText: computed(
    function tooltipText() {
      console.log(typeof this.t('link1'));
      const link1 = this.t('link1') ? '<a href="' + this.t('link1') + '">' +
        this.t('linkName1') + '</a>' : '';
      const link2 = this.t('link2') ? '<a href="' + this.t('link2') + '">' +
        this.t('linkName2') + '</a>' : '';
      return this.t('tooltip', { link1, link2 });
    }
  ),

  actions: {
    onSelected() {
      const {
        onSelected,
        templateName,
      } = this.getProperties('onSelected', 'templateName');

      onSelected(templateName, this.generateTemplate());
    },
  },
});
