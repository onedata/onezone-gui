import { click } from 'ember-native-dom-helpers';

export default class GroupsHierarchyVisualiserHelper {
  constructor($node) {
    this.$node = $node;
  }

  clickRelation(columnGroupId, relationType, boxGroupId, boxRelationType) {
    const $toggle = this.getGroupBox(columnGroupId, relationType, boxGroupId)
      .find(`.group-box-relation.${boxRelationType}`);
    return click($toggle[0]);
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
