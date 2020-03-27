/**
 * Add new cluster using token view
 *
 * @module components/content-clusters-add
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-clusters-add'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersAdd',
});
