import SingleStepTemplate from 'onezone-gui/components/token-template-selector/single-step-template';
import layout from 'onezone-gui/templates/components/token-template-selector/single-step-template';

export default SingleStepTemplate.extend({
  layout,

  /**
   * @override
   */
  templateName: 'identity',

  /**
   * @override
   */
  template: Object.freeze({
    type: {
      identityToken: {},
    },
  }),

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',
});
