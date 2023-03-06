/**
 * A component that shows harvester configuration
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-config'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersConfig',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,
});
