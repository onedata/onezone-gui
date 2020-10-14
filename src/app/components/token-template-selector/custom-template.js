/**
 * Custom token template. Does not set any default data.
 *
 * @module components/token-template-selector/custom-template
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
  templateName: 'custom',

  /**
   * @override
   */
  template: Object.freeze({}),

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',
});
