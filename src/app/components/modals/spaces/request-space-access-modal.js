import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.requestSpaceAccessModal',

  /**
   * @virtual
   * @type {RequestSpaceAccessActionContext}
   */
  modalOptions: undefined,

  spaceMarketplaceData: reads('modalOptions.spaceMarketplaceData'),

  spaceName: reads('spaceMarketplaceData.name'),
});
