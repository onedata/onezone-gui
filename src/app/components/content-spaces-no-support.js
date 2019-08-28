/**
 * Information about no support for space and link to support page
 *
 * @module components/content-spaces-no-support
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';

import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-spaces-no-support'],

  i18n: service(),
  router: service(),

  i18nPrefix: 'components.contentSpacesNoSupport',

  actions: {
    openAddStorage() {
      return this.get('router').transitionTo(
        'onedata.sidebar.content.aspect',
        'support'
      );
    },
  },
});
