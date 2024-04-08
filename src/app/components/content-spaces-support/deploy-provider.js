/**
 * Content for support space tab: copy command to setup provider
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  classNames: ['deploy-provider-tab'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesSupport.deployProvider',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,
});
