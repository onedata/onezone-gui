import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesProviders.providerConfig',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @virtual
   * @type {Models.Provider}
   */
  provider: undefined,
});
