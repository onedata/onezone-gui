/**
 * Main container for space transfers view
 *
 * @module components/content-spaces-automation
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ContentOneproviderContainerBase from './content-oneprovider-container-base';

export default ContentOneproviderContainerBase.extend({
  classNames: ['content-spaces-automation'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesAutomation',
});
