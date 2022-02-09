/**
 * Content of popup with information about provider
 * 
 * @module components/content-provider-info
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-provider-info'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentProviderInfo',

  /**
   * @virtual
   * @type {Models.Provider}
   */
  provider: undefined,
});
