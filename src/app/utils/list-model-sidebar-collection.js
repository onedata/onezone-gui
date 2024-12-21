/**
 * FIXME: doc
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
