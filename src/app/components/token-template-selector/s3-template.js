/**
 * S3 token template. Sets token API to "oneclient".
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2025 Onedata (onedata.org)
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
  templateName: 's3',

  /**
   * @override
   */
  imagePath: 'assets/images/token-templates/oneclient.svg',

  /**
   * @override
   */
  generateTemplate() {
    return {
      name: constructTokenName(String(this.t('newTokenNamePrefix'))),
      caveats: [{
        type: 'interface',
        interface: 'oneclient',
      }],
    };
  },
});
