/**
 * Content for support space tab: copy command to setup provider
 *
 * @module components/content-spaces-support/deploy-provider
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TabBase from 'onezone-gui/components/content-spaces-support/-tab-base';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TabBase.extend(I18n, {
  classNames: ['deploy-provider-tab'],
  commandType: 'oneprovider',
  i18nPrefix: 'components.contentSpacesSupport.deployProvider',
});
