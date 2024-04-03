/**
 * A configuration aspect of space, allowing setting name and other properties.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { not, conditional, raw } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

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

  isReadOnly: not('space.privileges.update'),

  readOnlyTip: conditional(
    'isReadOnly',
    computed(function readOnlyTip() {
      return insufficientPrivilegesMessage({
        i18n: this.i18n,
        modelName: 'space',
        privilegeFlag: 'space_update',
      });
    }),
    raw('')
  ),
});
