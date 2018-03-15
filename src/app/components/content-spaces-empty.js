/**
 * A component with information about no spaces available
 *
 * @module components/content-spaces-empty
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-spaces-empty'],
  i18nPrefix: 'components.contentSpacesEmpty',
});
