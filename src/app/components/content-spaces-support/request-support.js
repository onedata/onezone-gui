/**
 * Content for support space tab: get token for manual support request 
 *
 * @module components/content-spaces-support/request-support
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['request-support-tab'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesSupport.requestSupport',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,
});
