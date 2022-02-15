/**
 * Content of popup with information about provider
 * 
 * @module components/provider-info-content
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['provider-info-content'],

  /**
   * @override
   */
  i18nPrefix: 'components.providerInfoContent',

  /**
   * @virtual
   * @type {Models.Provider}
   */
  provider: undefined,
});
