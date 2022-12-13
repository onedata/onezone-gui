/**
 * A configuration aspect of space, allowing setting name and other properties.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content-spaces-configuration', 'fill-flex-using-column'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesConfiguration',

  /**
   * @virtual
   * @type {Model.Space}
   */
  space: undefined,
});
