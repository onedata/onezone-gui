/**
 * Token template base component. Allows to construct templates, which do not require any
 * additional adjustments.
 *
 * @module components/token-template-selector/single-step-template
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  tagName: '',

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
