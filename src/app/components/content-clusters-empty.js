/**
 * Info view when no clusters are available for current user
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  classNames: 'content-clusters-empty',

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersEmpty',
});
