/**
 * Main container for space transfers view
 *
 * @module components/content-spaces-automation
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ContentOneproviderContainerBase from './content-oneprovider-container-base';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default ContentOneproviderContainerBase.extend({
  classNames: ['content-spaces-automation'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesAutomation',

  /**
   * @type {ComputedProperty<String>}
   */
  tab: reads('navigationState.aspectOptions.tab'),

  /**
   * @type {ComputedProperty<String>}
   */
  workflowExecutionId: reads('navigationState.aspectOptions.workflowExecutionId'),

  /**
   * @type {ComputedProperty<String>}
   */
  workflowSchemaId: reads('navigationState.aspectOptions.workflowSchemaId'),

  /**
   * @type {ComputedProperty<String>}
   */
  fillInputStores: computed(
    'navigationState.aspectOptions.fillInputStores',
    function fillInputStores() {
      const queryParam = this.get('navigationState.aspectOptions.fillInputStores');
      return Boolean(queryParam) && queryParam !== 'false';
    }
  ),
});
