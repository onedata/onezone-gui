/**
 * Identity token template. Sets token type to "identity".
 *
 * @module components/token-template-selector/identity-template
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
  imagePath: 'assets/images/token-templates/identity.svg',

  /**
   * @override
   */
  generateTemplate() {
    return {
      type: {
        identityToken: {},
      },
    };
  },
});
