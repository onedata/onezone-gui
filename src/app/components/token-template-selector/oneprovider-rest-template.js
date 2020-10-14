/**
 * Oneprovider REST token template. Sets token API to "rest" and narrows allowed services
 * to any Oneprovider.
 *
 * @module components/token-template-selector/oneprovider-rest-template
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleStepTemplate from 'onezone-gui/components/token-template-selector/single-step-template';
import layout from 'onezone-gui/templates/components/token-template-selector/single-step-template';
import { constructTokenName } from 'onezone-gui/utils/token-editor-utils';

export default SingleStepTemplate.extend({
  layout,

  /**
   * @override
   */
  templateName: 'oneproviderRest',

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',

  /**
   * @override
   */
  generateTemplate() {
    return {
      name: constructTokenName('Oneprovider REST'),
      caveats: [{
        type: 'service',
        whitelist: ['opw-*'],
      }, {
        type: 'interface',
        interface: 'rest',
      }],
    };
  },
});
