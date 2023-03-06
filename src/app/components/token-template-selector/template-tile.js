/**
 * One-tile component customized for token templates. Is a base for showing all of token
 * templates.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: tag `components.tokenTemplateSelector.templates.${'templateName'}`,

  /**
   * @virtual
   * @type {String}
   */
  templateName: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onClick: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  templateTileClasses: tag `token-template-selector-template-tile template-${'templateName'}`,
});
