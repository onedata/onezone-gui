/**
 * Content for support space tab: copy command to setup provider with existing data
 *
 * @module components/content-spaces-support/expose-data
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TabBase from 'onezone-gui/components/content-spaces-support/-tab-base';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TabBase.extend(I18n, {
  classNames: ['expose-data-tab'],
  commandType: 'onedatify',
  i18nPrefix: 'components.contentSpacesSupport.exposeData',
});
