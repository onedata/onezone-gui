import Component from '@ember/component';

export default Component.extend({
  tagName: 'li',
  classNames: ['lambda-functions-list-entry'],

  /**
   * @virtual
   * @type {Models.LambdaFunction}
   */
  lambdaFunction: undefined,

  /**
   * @type {Boolean}
   */
  isExpanded: false,

  actions: {
    toggleDetails() {
      this.toggleProperty('isExpanded');
    },
  },
});
