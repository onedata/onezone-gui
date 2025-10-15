/**
 * FIXME: jsdoc
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { inject as service } from '@ember/service';
import RelatedGroupsDataModel from '../../utils/groups-hierarchy-visualiser/related-groups-column-data-model';
import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {Object} ColumnDataContainerSignature
 * @property {null} Element
 * @property {ColumnDataContainerArgs} Args
 */

/**
 * @typedef {Object} ColumnDataContainerArgs
 * @property {GroupHierarchyColumnDataModel} columnDataModel
 */

/** @extends {Component<ColumnDataContainerSignature>} */
export default class ColumnDataContainerComponent extends Component {
  @service batchRequestRegistry;

  get columnDataModel() {
    return this.args.columnDataModel;
  }

  @computed('columnDataModel.groupsProxy.content.list.content.length')
  get shouldRender() {
    return Boolean(
      this.columnDataModel.groupsProxy.content?.list.content?.length
    );
  }

  @action
  async didRenderContent() {
    await waitForRender();
    if (this.columnDataModel instanceof RelatedGroupsDataModel) {
      const containers = await allFulfilled([
        this.columnDataModel.childrenContainerProxy,
        this.columnDataModel.parentsContainerProxy,
      ]);
      for (const container of containers) {
        this.batchRequestRegistry.flushAndDestroy(container);
      }
    }
  }
}
