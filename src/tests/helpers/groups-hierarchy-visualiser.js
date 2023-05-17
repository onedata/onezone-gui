import { click, triggerEvent } from '@ember/test-helpers';
import globals from 'onedata-gui-common/utils/globals';

export default class GroupsHierarchyVisualiserHelper {
  constructor(node) {
    this.node = node;
  }

  async clickRelation(columnGroupId, relationType, boxGroupId, boxRelationType) {
    const toggle = this.getGroupBox(columnGroupId, relationType, boxGroupId)
      .querySelector(`.group-box-relation.${boxRelationType}`);
    await click(toggle);
  }

  async clickGroupBoxActions(groupBox, actionsChainSelectors) {
    await click(groupBox.querySelector('.group-actions-trigger'));
    for (const selector of actionsChainSelectors) {
      await click(globals.document.querySelector('.webui-popover.in ' + selector));
    }
  }

  async clickRelationActions(groupBox, actionSelector) {
    await triggerEvent(groupBox.querySelector('.group-box-line'), 'mouseover');
    await click(groupBox.querySelector('.group-box-line .actions-trigger'));
    await click(globals.document.querySelector('.webui-popover.in ' + actionSelector));
  }

  getAllColumns() {
    return Array.from(this.node.querySelectorAll('.column'));
  }

  getColumn(columnGroupId, relationType) {
    const groupId = columnGroupId ? `.group-${columnGroupId}` : '';
    return this.node.querySelector(`.column${groupId}.${relationType}`);
  }

  getGroupBox(columnGroupId, relationType, boxGroupId) {
    const column = this.getColumn(columnGroupId, relationType);
    return column ? column.querySelector(`.group-box.group-${boxGroupId}`) : null;
  }

  getAllGroupBoxes(columnGroupId, relationType) {
    const column = this.getColumn(columnGroupId, relationType);
    return column ? Array.from(column.querySelectorAll('.group-box')) : [];
  }
}
