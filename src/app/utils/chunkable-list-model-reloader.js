/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

export default class ChunkableListModelReloader extends EmberObject {
  listSortKey = 'index';

  /**
   * @virtual
   * @type {GraphListModel}
   */
  listModel = undefined;

  /**
   * @virtual optional
   * @type {() => Promise<void>|void}
   */
  onListChanged = undefined;

  @computed
  get observedProperty() {
    return `listModel.list.@each.${this.listSortKey}`;
  }

  /** @override */
  init() {
    super.init(...arguments);
    this.addObserver(this.observedProperty, this, 'handleListChange', false);
  }

  /** @override */
  willDestroy() {
    try {
      this.removeObserver(this.observedProperty, this, 'handleListChange', false);
    } finally {
      super.willDestroy(...arguments);
    }
  }

  async handleListChange() {
    if (this.chunksArray) {
      await this.chunksArray.scheduleReload();
      await this.chunksArray.startChanged();
    }
    await this.onListChanged?.();
  }
}
