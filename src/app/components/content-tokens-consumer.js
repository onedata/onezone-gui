/**
 * A component for consuming tokens
 *
 * @module components/content-tokens-consumer
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content-tokens-consumer'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensConsumer',
});
