/**
 * Renders api samples content.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ApiSamples from 'onedata-gui-common/components/api-samples';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import globals from 'onedata-gui-common/utils/globals';

export default ApiSamples.extend({
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.apiSamples',

  /**
   * @override
   */
  product: 'onezone',

  /**
   * @type {String} URL to create access token view
   */
  accessTokenUrl: computed(function accessTokenUrl() {
    const tokenTemplate = {
      type: { accessToken: {} },
      caveats: [{
        type: 'interface',
        interface: 'rest',
      }, {
        type: 'service',
        whitelist: ['ozw-onezone'],
      }],
    };
    return globals.location.origin + globals.location.pathname + this.router.urlFor(
      'onedata.sidebar.content',
      'tokens',
      'new', {
        queryParams: {
          options: serializeAspectOptions({
            activeSlide: 'form',
            tokenTemplate: btoa(JSON.stringify(tokenTemplate)),
          }),
        },
      }
    );
  }),
});
