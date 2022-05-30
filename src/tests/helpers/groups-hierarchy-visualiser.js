import { click, triggerEvent } from '@ember/test-helpers';
import { resolve } from 'rsvp';
import $ from 'jquery';

export default class GroupsHierarchyVisualiserHelper {
  constructor($node) {
    this.$node = $node;
  }

  clickRelation(columnGroupId, relationType, boxGroupId, boxRelationType) {
    const $toggle = this.getGroupBox(columnGroupId, relationType, boxGroupId)
      .find(`.group-box-relation.${boxRelationType}`);
    return click($toggle[0]);
  }

  clickGroupBoxActions($groupBox, actionsChainSelectors) {
    return click($groupBox.find('.group-actions-trigger')[0]).then(() => {
      let clickPromise = resolve();
      actionsChainSelectors.forEach(selector => {
        clickPromise = clickPromise
          .then(() => click($('body .webui-popover.in ' + selector)[0]));
      });
      return clickPromise;
    });
  }

  clickRelationActions($groupBox, actionSelector) {
    return triggerEvent($groupBox.find('.group-box-line')[0], 'mouseover').then(() => {
      return click($groupBox.find('.group-box-line .actions-trigger')[0]).then(() =>
        click($('body .webui-popover.in ' + actionSelector)[0])
      );
    });
  }

  getAllColumns() {
    return this.$node.find('.column');
  }

  getColumn(columnGroupId, relationType) {
    const groupId = columnGroupId ? `.group-${columnGroupId}` : '';
    return this.$node.find(`.column${groupId}.${relationType}`);
  }

  getGroupBox(columnGroupId, relationType, boxGroupId) {
    return this.getColumn(columnGroupId, relationType)
      .find(`.group-box.group-${boxGroupId}`);
  }

  getAllGroupBoxes(columnGroupId, relationType) {
    return this.getColumn(columnGroupId, relationType).find('.group-box');
  }
}
