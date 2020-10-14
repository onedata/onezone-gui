import SingleStepTemplate from 'onezone-gui/components/token-template-selector/single-step-template';
import layout from 'onezone-gui/templates/components/token-template-selector/single-step-template';

export default SingleStepTemplate.extend({
  layout,

  /**
   * @override
   */
  templateName: 'oneproviderRest',

  /**
   * @override
   */
  template: Object.freeze({
    caveats: [{
      type: 'service',
      whitelist: ['opw-*'],
    }, {
      type: 'interface',
      interface: 'rest',
    }],
  }),

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',
});
