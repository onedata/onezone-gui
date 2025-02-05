/**
 * Global share view - show single share accessible from shares > share menu.
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-shares-index'],
  classNameBindings: ['spaceProxy.isFulfilled:is-loaded'],

  navigationState: service(),
  shareManager: service(),
  pointerEvents: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSharesIndex',

  /**
   * @virtual
   * @type {Models.Share}
   */
  share: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Models.Space>>}
   */
  spaceProxy: reads('share.space'),
});
