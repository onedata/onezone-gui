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
   * @type {Object}
   */
  template: undefined,

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
});
