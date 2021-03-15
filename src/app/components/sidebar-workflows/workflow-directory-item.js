/**
 * A first-level item component for workflow directories sidebar.
 *
 * @module components/sidebar-workflows/workflow-directory-item
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';

export default Component.extend({
  tagName: '',

  /**
   * @type {Models.WorkflowDirectory}
   */
  item: undefined,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  inSidenav: false,

  /**
   * Alias for `item` to make code more verbose
   * @type {ComputedProperty<Models.WorkflowDirectory>}
   */
  workflowDirectory: reads('item'),
});
