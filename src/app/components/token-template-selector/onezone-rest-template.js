import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  tagName: '',

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onSelected: notImplementedIgnore,

  /**
   * @type {Object}
   */
  template: Object.freeze({
    caveats: [{
      type: 'service',
      whitelist: ['ozw-onezone'],
    }, {
      type: 'interface',
      interface: 'rest',
    }],
  }),
});
