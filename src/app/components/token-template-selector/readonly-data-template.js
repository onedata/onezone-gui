/**
 * Read-only data token template. Sets token readonly caveat.
 *
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
  templateName: 'readonlyData',

  /**
   * @override
   */
  imagePath: 'assets/images/token-templates/readonly-data-access.svg',

  /**
   * @override
   */
  generateTemplate() {
    return {
      name: constructTokenName(String(this.t('newTokenNamePrefix'))),
      caveats: [{
        type: 'data.readonly',
      }],
    };
  },
});
