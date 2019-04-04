/**
 * Content for support space tab: get token for manual support request 
 *
 * @module components/content-spaces-support/request-support
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TabBase from 'onezone-gui/components/content-spaces-support/-tab-base';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default TabBase.extend(I18n, {
  classNames: ['request-support-tab'],
  i18nPrefix: 'components.contentSpacesSupport.requestSupport',

  /**
   * @virtual
   * @type {Function}
   */
  getNewSupportToken: notImplementedReject,

  actions: {
    getNewSupportToken() {
      return this.get('getNewSupportToken')();
    },
  },
});
