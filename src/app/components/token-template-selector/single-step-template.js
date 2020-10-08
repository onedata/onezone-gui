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
   * @type {Function}
   * @returns {any}
   */
  onClick: notImplementedIgnore,
});
