/**
 * Information about no supporting Oneproviders in required versions for the space
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';

import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-spaces-old-oneprovider'],

  i18n: service(),
  router: service(),

  i18nPrefix: 'components.contentSpacesOldOneprovider',

  /**
   * @virtual
   * @type {string}
   */
  requiredVersion: undefined,

  /**
   * @virtual
   * @type {'allOld'|'allNewOffline'|'selectedOld'}
   */
  infoType: undefined,
});
