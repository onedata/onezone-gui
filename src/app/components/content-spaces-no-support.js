/**
 * Information about no support for space and link to support page
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';

import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  classNames: ['content-spaces-no-support'],

  i18n: service(),
  router: service(),

  i18nPrefix: 'components.contentSpacesNoSupport',
});
