/**
 * Main container for space transfers view
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-spaces-transfers'],

  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesTransfers',

  /**
   * @type {string}
   */
  fileId: reads('navigationState.aspectOptions.fileId'),

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  /**
   * @type {string}
   */
  tab: reads('navigationState.aspectOptions.tab'),
});
