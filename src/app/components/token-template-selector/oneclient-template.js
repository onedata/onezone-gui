/**
 * Oneclient token template. Sets token API to "oneclient".
 *
 * @module components/token-template-selector/oneclient-template
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
  templateName: 'oneclient',

  /**
   * @override
   */
  template: Object.freeze({
    caveats: [{
      type: 'interface',
      interface: 'oneclient',
    }],
  }),

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',
});
