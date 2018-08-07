import GroupBoxLine from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box-line';
import Relation from 'onezone-gui/utils/groups-hierarchy-visualiser/relation';
import { computed, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';

export default GroupBoxLine.extend({
  /**
   * @override
   */
  isVisible: computed(
    'groupBox',
    'column.{hasChildrenLines,parentsRelationGroupBox,prevColumn.groupBoxes.length}',
    function isVisible() {
      const {
        hasChildrenLines,
        parentsRelationGroupBox,
        prevColumn,
      } = getProperties(
        this.get('column'),
        'hasChildrenLines',
        'parentsRelationGroupBox',
        'prevColumn'
      );
      return !!(hasChildrenLines || (
        this.get('groupBox') === parentsRelationGroupBox &&
        prevColumn && get(prevColumn, 'groupBoxes.length')
      ));
    }
  ),

  /**
   * @override
   */
  x: reads('column.groupBoxLeftLineX'),

  /**
   * @override
   */
  y: reads('column.groupBoxLeftLineY'),

  /**
   * @override
   */
  length: reads('column.groupBoxLeftLineLength'),

  /**
   * @override
   */
  actionsEnabled: reads('column.hasChildrenLines'),

  /**
   * @override
   */
  relation: computed('groupBox.{group,column.relatedGroup}', function relation() {
    const groupBox = this.get('groupBox');
    return Relation.create({
      parentGroup: get(groupBox, 'column.relatedGroup'),
      childGroup: get(groupBox, 'group'),
    });
  }),
});
