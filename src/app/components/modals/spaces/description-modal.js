/**
 * Modal showing single marketplace space details.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { reads } from '@ember/object/computed';

/**
 * Both `Utils.SpacesMarketplaceItem` and `Models.Space` types can be used to provide
 * this type data.
 * @typedef {Object} SpaceDescriptionModal.SpaceData
 * @property {string} name
 * @property {string} description
 * @property {string} [conflictLabel]
 */

/**
 * @typedef {Object} SpacesMarketplaceItemModalOptions
 * @property {SpaceDescriptionModal.SpaceData} spaceData
 */

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.descriptionModal',

  /**
   * @virtual
   * @type {SpacesMarketplaceItemModalOptions}
   */
  modalOptions: undefined,

  /**
   * @type {ComputedProperty<SpaceDescriptionModal.SpaceData>}
   */
  spaceData: reads('modalOptions.spaceData'),
});
