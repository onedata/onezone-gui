import Component from '@ember/component';

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

  actions: {
    onClick() {
      const {
        templateName,
        template,
        onClick,
      } = this.getProperties('templateName', 'template', 'onClick');

      if (onClick) {
        onClick(templateName, template);
      }
    },
  },
});
