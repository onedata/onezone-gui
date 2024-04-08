/**
 * Container for remote file browser of single space with Oneprovider selector
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/i18n';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-spaces-data'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesData',
});
