/**
 * Implementation of SidebarCollection (abstraction layer of collection for sidebar)
 * that works on top of list models (GRI models with `list` property).
 *
 * It is suitable for models that have list model available.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @implements {SidebarCollection}
 */
export class ListModelSidebarCollection {
  @tracked listModel;

  constructor(listModel) {
    this.listModel = listModel;
  }

  @computed('listModel.list.content.[]')
  get array() {
    return this.listModel?.list?.content.toArray();
  }

  get ids() {
    return this.listModel?.belongsTo?.('list')?.ids?.() ?? [];
  }
}
